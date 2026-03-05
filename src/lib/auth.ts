// ─────────────────────────────────────────────────
// 履约通 — 双模式认证核心
//
// ┌─────────────┬──────────────────────────────────┐
// │ Standalone   │ 自带登录页，演示账号，本地token  │
// │ Chain        │ 上游JWT注入，无登录页，带返回链接 │
// └─────────────┴──────────────────────────────────┘
//
// URL 参数约定 (Chain 模式):
//   ?from=main&token=<jwt>&return_url=<url>&source_app=<name>
//
// 安全原则:
//   1. token 永远不写入 audit_logs / console / HTML 明文
//   2. JWT payload 脱敏后才记录 (仅保留 sub/role/exp)
//   3. token 仅通过 httpOnly cookie 或 Authorization header 传递
//   4. Chain 模式 token 在 URL 中仅用于首次握手，立即消费并重定向清除
// ─────────────────────────────────────────────────

export type AppMode = 'standalone' | 'chain'

// ── Session 用户信息 (从 JWT payload 或演示登录提取) ──
export interface SessionUser {
  sub: string        // 用户唯一标识
  name: string       // 显示名称
  role: string       // 角色 (admin/operator/viewer)
  email?: string     // 邮箱 (可选)
}

// ── Chain 上下文 (记录到 audit_logs) ──
export interface ChainContext {
  source_app: string     // 来源应用名称
  return_url: string     // 返回跳转地址
  entry_time: string     // 进入时间 (ISO 8601)
  entry_path: string     // 进入路径
  user_sub: string       // 用户标识 (脱敏)
  token_fingerprint: string  // token 指纹 (sha256 前8位, 不记录完整token)
}

// ── 完整认证会话 ──
export interface AuthSession {
  mode: AppMode
  user: SessionUser
  token: string           // 运行时使用，永远不写入日志
  chain_context?: ChainContext
  expires_at: number      // Unix timestamp
}

// ── 审计日志条目 ──
export interface AuditLogEntry {
  id: string
  timestamp: string
  action: string
  mode: AppMode
  user_sub: string        // 只记录 sub, 不记录敏感信息
  user_role: string
  path: string
  chain_context?: Omit<ChainContext, 'token_fingerprint'> & { token_fp: string }  // 缩写指纹
  detail?: string
}

// ═══════════════════════════════════════════════════
// JWT 工具 (纯 Web Crypto API, Cloudflare Workers 兼容)
// ═══════════════════════════════════════════════════

const JWT_SECRET = 'sc-demo-secret-2026-not-for-production'  // 演示用，生产环境应用 env.JWT_SECRET

/** Base64URL 编码 */
function base64url(data: Uint8Array): string {
  const str = Array.from(data).map(b => String.fromCharCode(b)).join('')
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** Base64URL 解码 */
function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, '+').replace(/_/g, '/')
  while (str.length % 4) str += '='
  const binary = atob(str)
  return new Uint8Array(Array.from(binary).map(c => c.charCodeAt(0)))
}

/** 生成 HMAC-SHA256 签名 */
async function hmacSign(payload: string): Promise<string> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  return base64url(new Uint8Array(signature))
}

/** 验证 HMAC-SHA256 签名 */
async function hmacVerify(payload: string, signature: string): Promise<boolean> {
  const expected = await hmacSign(payload)
  return expected === signature
}

/** 签发 JWT (HS256) */
export async function signJWT(payload: Record<string, any>, expiresInSec = 86400): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSec }
  const encoder = new TextEncoder()
  const headerB64 = base64url(encoder.encode(JSON.stringify(header)))
  const payloadB64 = base64url(encoder.encode(JSON.stringify(fullPayload)))
  const toSign = `${headerB64}.${payloadB64}`
  const sig = await hmacSign(toSign)
  return `${toSign}.${sig}`
}

/** 验证并解析 JWT */
export async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return { valid: false, error: 'malformed_token' }

    const [headerB64, payloadB64, sig] = parts
    const toVerify = `${headerB64}.${payloadB64}`

    const isValid = await hmacVerify(toVerify, sig)
    if (!isValid) return { valid: false, error: 'invalid_signature' }

    const decoder = new TextDecoder()
    const payload = JSON.parse(decoder.decode(base64urlDecode(payloadB64)))

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'token_expired' }
    }

    return { valid: true, payload }
  } catch {
    return { valid: false, error: 'parse_error' }
  }
}

/** 生成 token 指纹 (SHA-256 前8字符, 用于审计日志) */
export async function tokenFingerprint(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const hash = await crypto.subtle.digest('SHA-256', encoder.encode(token))
  return base64url(new Uint8Array(hash)).substring(0, 8)
}

// ═══════════════════════════════════════════════════
// 模式判断逻辑
// ═══════════════════════════════════════════════════

/**
 * 判断请求模式：
 * 1. URL 含 from=... & token=... → Chain 模式
 * 2. Cookie 含 sc_session → 解析 session.mode
 * 3. 其他 → 需要登录 (Standalone)
 */
export function detectMode(url: URL): { mode: AppMode; isChainEntry: boolean } {
  const from = url.searchParams.get('from')
  const token = url.searchParams.get('token')

  if (from && token) {
    return { mode: 'chain', isChainEntry: true }
  }
  return { mode: 'standalone', isChainEntry: false }
}

/**
 * 从 URL 提取 Chain 参数
 */
export function extractChainParams(url: URL): {
  from: string
  token: string
  return_url: string
  source_app: string
} {
  return {
    from: url.searchParams.get('from') || '',
    token: url.searchParams.get('token') || '',
    return_url: url.searchParams.get('return_url') || url.searchParams.get('returnUrl') || '',
    source_app: url.searchParams.get('source_app') || url.searchParams.get('from') || 'unknown',
  }
}

// ═══════════════════════════════════════════════════
// 演示账号 (Standalone 模式)
// ═══════════════════════════════════════════════════

export const DEMO_USERS = [
  { username: 'admin', password: 'admin123', sub: 'usr_admin_001', name: '张管理', role: 'admin', email: 'admin@sc.example' },
  { username: 'operator', password: 'oper123', sub: 'usr_oper_001', name: '李主管', role: 'operator', email: 'operator@sc.example' },
  { username: 'viewer', password: 'view123', sub: 'usr_view_001', name: '王审计', role: 'viewer', email: 'viewer@sc.example' },
] as const

// ═══════════════════════════════════════════════════
// 审计日志 (内存存储, 生产环境应用 D1/KV)
// ═══════════════════════════════════════════════════

const _auditLogs: AuditLogEntry[] = []
let _logIdCounter = 1

/**
 * 记录审计日志
 * ⚠️ 安全: 永远不记录完整 token, 仅记录 fingerprint 前8位
 */
export function writeAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
  _auditLogs.unshift({
    ...entry,
    id: `AL-${String(_logIdCounter++).padStart(6, '0')}`,
    timestamp: new Date().toISOString(),
  })
  // 内存限制: 最多保留 500 条
  if (_auditLogs.length > 500) _auditLogs.pop()
}

export function getAuditLogs(limit = 50): AuditLogEntry[] {
  return _auditLogs.slice(0, limit)
}

// ═══════════════════════════════════════════════════
// Session Cookie 编解码
// ═══════════════════════════════════════════════════

/** 将 session 编码为 cookie 值 (base64, 不含 token 明文) */
export function encodeSessionCookie(session: AuthSession): string {
  // Cookie 中只存必要信息, token 不放 cookie (用 httpOnly 的 sc_token 单独存)
  const data = {
    mode: session.mode,
    user: session.user,
    expires_at: session.expires_at,
    chain_context: session.chain_context ? {
      source_app: session.chain_context.source_app,
      return_url: session.chain_context.return_url,
      entry_time: session.chain_context.entry_time,
      entry_path: session.chain_context.entry_path,
    } : undefined,
  }
  const encoder = new TextEncoder()
  return base64url(encoder.encode(JSON.stringify(data)))
}

/** 从 cookie 解码 session */
export function decodeSessionCookie(cookieValue: string): Omit<AuthSession, 'token'> | null {
  try {
    const decoder = new TextDecoder()
    const json = decoder.decode(base64urlDecode(cookieValue))
    return JSON.parse(json)
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════
// Cookie helper
// ═══════════════════════════════════════════════════

export function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) return {}
  const cookies: Record<string, string> = {}
  cookieHeader.split(';').forEach(pair => {
    const [key, ...vals] = pair.trim().split('=')
    if (key) cookies[key.trim()] = vals.join('=').trim()
  })
  return cookies
}
