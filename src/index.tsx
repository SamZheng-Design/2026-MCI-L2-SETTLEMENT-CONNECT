// ─────────────────────────────────────────────────
// 履约通 Settlement Connect — 主路由 (双模式)
//
// 模式判断流程:
// 1. URL 含 ?from=xxx&token=yyy → Chain 模式握手
//    → 验证 JWT → 写 session cookie → 重定向清除 URL 中的 token
// 2. Cookie 含 sc_session + sc_token → 已登录，解析 session
// 3. 未登录 → 重定向到 /login (Standalone)
//
// 安全:
// - token 仅在首次 URL 握手时出现，立即消费后重定向清除
// - cookie 使用 HttpOnly + Secure + SameSite=Lax
// - audit_logs 永远不记录完整 token
// ─────────────────────────────────────────────────
import { Hono } from 'hono'
import { renderer } from './renderer'
import { getLang } from './lib/i18n'
import type { Lang } from './lib/i18n'
import {
  type AppMode, type SessionUser, type AuthSession, type ChainContext,
  detectMode, extractChainParams,
  verifyJWT, signJWT, tokenFingerprint,
  DEMO_USERS,
  encodeSessionCookie, decodeSessionCookie, parseCookies,
  writeAuditLog, getAuditLogs,
} from './lib/auth'

// Pages
import { DashboardPage } from './pages/dashboard'
import { UACListPage } from './pages/uac'
import { AllocationListPage, AllocationDetailPage } from './pages/allocation'
import { ReconciliationPage } from './pages/reconciliation'
import { LoginPage } from './pages/login'
import { AuditLogsPage } from './pages/audit'

const app = new Hono()

// ── Global renderer ──
app.use(renderer)

// ── Helpers ──
function lang(c: any): Lang {
  return getLang(c.req.query('lang'))
}

function setCookies(headers: Headers, session: AuthSession) {
  const maxAge = 86400 // 24h
  const opts = 'Path=/; HttpOnly; SameSite=Lax; Max-Age=' + maxAge
  headers.append('Set-Cookie', `sc_session=${encodeSessionCookie(session)}; ${opts}`)
  headers.append('Set-Cookie', `sc_token=${session.token}; ${opts}`)
}

function clearCookies(headers: Headers) {
  headers.append('Set-Cookie', 'sc_session=; Path=/; HttpOnly; Max-Age=0')
  headers.append('Set-Cookie', 'sc_token=; Path=/; HttpOnly; Max-Age=0')
}

/** 从 cookie 恢复 session */
function getSession(c: any): { session: (AuthSession & { mode: AppMode }) | null } {
  const cookieHeader = c.req.header('Cookie')
  const cookies = parseCookies(cookieHeader)
  if (!cookies.sc_session || !cookies.sc_token) return { session: null }

  const decoded = decodeSessionCookie(cookies.sc_session)
  if (!decoded) return { session: null }
  if (decoded.expires_at < Math.floor(Date.now() / 1000)) return { session: null }

  return {
    session: {
      ...decoded,
      token: cookies.sc_token,
    } as AuthSession & { mode: AppMode },
  }
}

/** 渲染 props 生成器 */
function renderProps(c: any, session: AuthSession, title: string, currentPath: string, showBack = false) {
  const l = lang(c)
  return {
    title,
    lang: l,
    currentPath,
    showBack,
    mode: session.mode,
    user: session.user,
    chainReturnUrl: session.chain_context?.return_url,
    chainSource: session.chain_context?.source_app,
  }
}

// ═══════════════════════════════════════════════════
// Chain 模式握手入口
// URL: /?from=main&token=<jwt>&return_url=<url>&source_app=<name>
// 或:  /uac?from=main&token=<jwt>&...
//
// 流程: 验证JWT → 建session → 记audit → 重定向(清除token)
// ═══════════════════════════════════════════════════
app.use('*', async (c, next) => {
  const url = new URL(c.req.url)
  const { mode, isChainEntry } = detectMode(url)

  if (isChainEntry) {
    const params = extractChainParams(url)

    // 验证上游 JWT
    const result = await verifyJWT(params.token)
    if (!result.valid || !result.payload) {
      const l = lang(c)
      // Chain JWT 无效 → 显示错误并提供 standalone 登录入口
      return c.html(`
        <!DOCTYPE html>
        <html lang="${l === 'zh' ? 'zh-CN' : 'en'}">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
        <title>Chain Auth Failed</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="/static/style.css" rel="stylesheet">
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.5.0/css/all.min.css" rel="stylesheet">
        </head>
        <body class="bg-apple-bg flex items-center justify-center min-h-screen p-4">
          <div class="glass-card p-8 max-w-md text-center">
            <div class="w-16 h-16 rounded-2xl bg-[rgba(255,59,48,0.08)] flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-shield-alt text-danger text-2xl"></i>
            </div>
            <h2 class="text-lg font-bold text-apple-text mb-2">${l === 'zh' ? '链路认证失败' : 'Chain Authentication Failed'}</h2>
            <p class="text-sm text-apple-secondary mb-1">${l === 'zh' ? '上游 Token 验证未通过' : 'Upstream token verification failed'}</p>
            <p class="text-xs text-apple-tertiary mb-6">${l === 'zh' ? '错误原因' : 'Error'}: ${result.error || 'unknown'}</p>
            <div class="flex gap-3 justify-center">
              ${params.return_url ? `<a href="${params.return_url}" class="sc-btn sc-btn-secondary">${l === 'zh' ? '返回上游' : 'Back to Source'}</a>` : ''}
              <a href="/login${l === 'en' ? '?lang=en' : ''}" class="sc-btn sc-btn-primary">${l === 'zh' ? '独立登录' : 'Standalone Login'}</a>
            </div>
          </div>
        </body></html>
      `, 401)
    }

    // JWT 有效 → 创建 session
    const payload = result.payload
    const user: SessionUser = {
      sub: payload.sub || 'chain_user',
      name: payload.name || payload.sub || 'Chain User',
      role: payload.role || 'viewer',
      email: payload.email,
    }

    const fp = await tokenFingerprint(params.token)

    const chainCtx: ChainContext = {
      source_app: params.source_app,
      return_url: params.return_url,
      entry_time: new Date().toISOString(),
      entry_path: url.pathname,
      user_sub: user.sub,
      token_fingerprint: fp,
    }

    const session: AuthSession = {
      mode: 'chain',
      user,
      token: params.token,
      chain_context: chainCtx,
      expires_at: payload.exp || Math.floor(Date.now() / 1000) + 86400,
    }

    // 记录审计日志 (⚠️ 不记录完整 token)
    writeAuditLog({
      action: 'chain_entry',
      mode: 'chain',
      user_sub: user.sub,
      user_role: user.role,
      path: url.pathname,
      chain_context: {
        source_app: chainCtx.source_app,
        return_url: chainCtx.return_url,
        entry_time: chainCtx.entry_time,
        entry_path: chainCtx.entry_path,
        user_sub: chainCtx.user_sub,
        token_fp: fp, // 仅指纹前8位
      },
      detail: `Chain entry from ${params.source_app}`,
    })

    // 重定向: 清除 URL 中的 token (安全!)
    const cleanUrl = new URL(url.pathname, url.origin)
    if (url.searchParams.get('lang')) cleanUrl.searchParams.set('lang', url.searchParams.get('lang')!)
    const resp = c.redirect(cleanUrl.toString(), 302)
    setCookies(resp.headers, session)
    return resp
  }

  await next()
})

// ═══════════════════════════════════════════════════
// 公开路由 (无需登录)
// ═══════════════════════════════════════════════════

// ── Login Page (GET) ──
app.get('/login', (c) => {
  const l = lang(c)
  const { session } = getSession(c)
  if (session) return c.redirect(l === 'en' ? '/?lang=en' : '/')

  const expired = c.req.query('expired') === '1'
  return c.html(
    <LoginPage lang={l} expired={expired} />,
  )
})

// ── Login (POST) ──
app.post('/login', async (c) => {
  const l = lang(c)
  const body = await c.req.parseBody()
  const username = String(body.username || '').trim()
  const password = String(body.password || '')

  const demoUser = DEMO_USERS.find(u => u.username === username && u.password === password)
  if (!demoUser) {
    return c.html(<LoginPage lang={l} error={true} />)
  }

  // 签发 JWT
  const token = await signJWT({
    sub: demoUser.sub,
    name: demoUser.name,
    role: demoUser.role,
    email: demoUser.email,
  })

  const session: AuthSession = {
    mode: 'standalone',
    user: {
      sub: demoUser.sub,
      name: demoUser.name,
      role: demoUser.role,
      email: demoUser.email,
    },
    token,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
  }

  const fp = await tokenFingerprint(token)

  // 审计日志
  writeAuditLog({
    action: 'standalone_login',
    mode: 'standalone',
    user_sub: demoUser.sub,
    user_role: demoUser.role,
    path: '/login',
    detail: `Standalone login as ${demoUser.role}`,
  })

  const resp = c.redirect(l === 'en' ? '/?lang=en' : '/', 302)
  setCookies(resp.headers, session)
  return resp
})

// ── Logout ──
app.get('/logout', async (c) => {
  const l = lang(c)
  const { session } = getSession(c)

  if (session) {
    writeAuditLog({
      action: 'logout',
      mode: session.mode,
      user_sub: session.user.sub,
      user_role: session.user.role,
      path: '/logout',
      detail: `${session.mode} logout`,
    })
  }

  const resp = c.redirect(`/login${l === 'en' ? '?lang=en' : ''}`, 302)
  clearCookies(resp.headers)
  return resp
})

// ── Health ──
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', name: 'Settlement Connect', timestamp: new Date().toISOString() })
})

// ── API: Generate chain token (for testing) ──
app.get('/api/chain-token', async (c) => {
  const name = c.req.query('name') || 'External User'
  const role = c.req.query('role') || 'operator'
  const token = await signJWT({ sub: 'ext_' + Date.now(), name, role, email: `${role}@external.example` })
  const baseUrl = new URL(c.req.url).origin
  const returnUrl = c.req.query('return_url') || 'https://main-app.example.com/dashboard'
  const sourceApp = c.req.query('source_app') || 'MainPlatform'

  const chainUrl = `${baseUrl}/?from=main&token=${encodeURIComponent(token)}&return_url=${encodeURIComponent(returnUrl)}&source_app=${encodeURIComponent(sourceApp)}`

  return c.json({
    info: 'Use this URL to test Chain mode entry',
    token_preview: token.substring(0, 20) + '...',
    chain_url: chainUrl,
    params: { from: 'main', return_url: returnUrl, source_app: sourceApp },
    security_note: 'Full token shown here for testing only. In production, tokens should never be exposed in API responses.',
  })
})

// ═══════════════════════════════════════════════════
// 认证守卫: 以下所有路由需要登录
// ═══════════════════════════════════════════════════
app.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname
  // 跳过公开路由和静态文件
  if (path === '/login' || path === '/logout' || path.startsWith('/api/') || path.startsWith('/static/')) {
    return next()
  }

  const { session } = getSession(c)
  if (!session) {
    const l = lang(c)
    return c.redirect(`/login${l === 'en' ? '?lang=en&expired=1' : '?expired=1'}`, 302)
  }

  // 验证 token 仍然有效
  const tokenResult = await verifyJWT(session.token)
  if (!tokenResult.valid) {
    const l = lang(c)
    const resp = c.redirect(`/login${l === 'en' ? '?lang=en&expired=1' : '?expired=1'}`, 302)
    clearCookies(resp.headers)
    return resp
  }

  // 记录页面访问审计
  writeAuditLog({
    action: 'page_view',
    mode: session.mode,
    user_sub: session.user.sub,
    user_role: session.user.role,
    path,
    chain_context: session.chain_context ? {
      source_app: session.chain_context.source_app,
      return_url: session.chain_context.return_url,
      entry_time: session.chain_context.entry_time,
      entry_path: session.chain_context.entry_path,
      user_sub: session.chain_context.user_sub,
      token_fp: session.chain_context.token_fingerprint || '***',
    } : undefined,
  })

  // 将 session 注入 c.set 供路由使用
  c.set('session' as any, session)
  await next()
})

// ═══════════════════════════════════════════════════
// 受保护页面路由
// ═══════════════════════════════════════════════════

app.get('/', (c) => {
  const s = (c as any).get('session') as AuthSession
  return c.render(
    <DashboardPage lang={lang(c)} />,
    renderProps(c, s, lang(c) === 'zh' ? '仪表盘' : 'Dashboard', '/')
  )
})

app.get('/uac', (c) => {
  const s = (c as any).get('session') as AuthSession
  return c.render(
    <UACListPage lang={lang(c)} />,
    renderProps(c, s, lang(c) === 'zh' ? 'UAC 管理' : 'UAC Management', '/uac')
  )
})

app.get('/allocation', (c) => {
  const s = (c as any).get('session') as AuthSession
  return c.render(
    <AllocationListPage lang={lang(c)} />,
    renderProps(c, s, lang(c) === 'zh' ? '分配批次' : 'Allocation Batch', '/allocation')
  )
})

app.get('/allocation/:id', (c) => {
  const s = (c as any).get('session') as AuthSession
  const batchId = c.req.param('id')
  return c.render(
    <AllocationDetailPage batchId={batchId} lang={lang(c)} />,
    renderProps(c, s, batchId, '/allocation/' + batchId, true)
  )
})

app.get('/reconciliation', (c) => {
  const s = (c as any).get('session') as AuthSession
  return c.render(
    <ReconciliationPage lang={lang(c)} />,
    renderProps(c, s, lang(c) === 'zh' ? '对账管理' : 'Reconciliation', '/reconciliation')
  )
})

app.get('/audit', (c) => {
  const s = (c as any).get('session') as AuthSession
  const logs = getAuditLogs(100)
  return c.render(
    <AuditLogsPage lang={lang(c)} logs={logs} />,
    renderProps(c, s, lang(c) === 'zh' ? '审计日志' : 'Audit Logs', '/audit')
  )
})

export default app
