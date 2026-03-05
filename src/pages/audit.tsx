// ─────────────────────────────────────────────────
// 审计日志页面 — 展示双模式访问记录
// ⚠️ 所有 token 信息已脱敏，仅展示 fingerprint 前8位
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtDate } from '../lib/i18n'
import type { AuditLogEntry } from '../lib/auth'
import type { AppMode } from '../lib/auth'
import { DataTable, StatusBadge, EmptyState } from '../components'

function ModeBadge({ mode, lang }: { mode: AppMode; lang: Lang }) {
  if (mode === 'chain') {
    return (
      <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(61,143,131,0.12)', color: '#3D8F83' }}>
        <i class="fas fa-link text-[9px]" aria-hidden="true"></i>
        {t('modeChain', lang)}
      </span>
    )
  }
  return (
    <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(93,196,179,0.1)', color: '#3a9e8f' }}>
      <i class="fas fa-desktop text-[9px]" aria-hidden="true"></i>
      {t('modeStandalone', lang)}
    </span>
  )
}

export function AuditLogsPage({ lang, logs }: { lang: Lang; logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <div>
        <h1 class="text-2xl font-bold tracking-tight mb-6">{t('auditTitle', lang)}</h1>
        <EmptyState
          lang={lang}
          message={t('auditEmpty', lang)}
          icon="fa-clipboard-list"
        />
      </div>
    )
  }

  const columns = [
    { key: 'time', label: t('auditTime', lang), sortType: 'text' as const },
    { key: 'action', label: t('auditAction', lang), sortType: 'text' as const },
    { key: 'user', label: t('auditUser', lang), sortType: 'text' as const },
    { key: 'role', label: t('userRole', lang) },
    { key: 'mode', label: t('auditMode', lang) },
    { key: 'path', label: t('auditPath', lang), sortType: 'text' as const },
    { key: 'chain', label: t('auditChainSrc', lang) },
    { key: 'detail', label: t('auditDetail', lang) },
  ]

  return (
    <div>
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('auditTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1">
            {t('total', lang)} {logs.length} {t('items', lang)}
          </p>
        </div>
      </div>

      {/* Security notice */}
      <div class="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ background: 'rgba(93,196,179,0.06)', border: '0.5px solid rgba(93,196,179,0.15)' }}>
        <i class="fas fa-shield-alt text-brand mt-0.5" aria-hidden="true"></i>
        <div class="text-xs text-apple-secondary leading-relaxed">
          {lang === 'zh'
            ? 'Token 信息已脱敏处理，仅展示 SHA-256 指纹前 8 位。完整 token 不会被记录到任何日志中。'
            : 'Token info is sanitized. Only first 8 chars of SHA-256 fingerprint are shown. Full tokens are never logged.'}
        </div>
      </div>

      <DataTable id="audit-table" columns={columns} lang={lang} pageSize={15}>
        {logs.map((log) => (
          <tr tabindex={0}>
            <td class="text-xs text-apple-secondary whitespace-nowrap">{fmtDate(log.timestamp, lang)}</td>
            <td>
              <span class="text-sm font-medium">{log.action}</span>
            </td>
            <td class="font-mono text-xs">{log.user_sub}</td>
            <td>
              <span class={`text-xs font-medium ${log.user_role === 'admin' ? 'text-brand' : log.user_role === 'operator' ? 'text-warning' : 'text-apple-secondary'}`}>
                {log.user_role}
              </span>
            </td>
            <td><ModeBadge mode={log.mode} lang={lang} /></td>
            <td class="font-mono text-xs text-apple-secondary">{log.path}</td>
            <td>
              {log.chain_context ? (
                <div class="text-xs">
                  <div class="text-apple-text">{log.chain_context.source_app}</div>
                  <div class="text-apple-tertiary font-mono">fp:{log.chain_context.token_fp}</div>
                </div>
              ) : (
                <span class="text-apple-tertiary text-xs">—</span>
              )}
            </td>
            <td class="text-xs text-apple-secondary max-w-[200px] truncate">{log.detail || '—'}</td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
