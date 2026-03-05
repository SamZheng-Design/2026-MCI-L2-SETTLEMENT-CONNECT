// ─────────────────────────────────────────────────
// 履约通 — JSX 通用组件库
// DataTable / FilterBar / StatusBadge / Modal / Drawer / Toast
// EmptyState / ErrorState / LoadingState
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtAmount, fmtDate } from '../lib/i18n'

// ══════════════════════════════════════════════════
// StatusBadge
// ══════════════════════════════════════════════════
export function StatusBadge({ status, lang }: { status: string; lang: Lang }) {
  const labelMap: Record<string, string> = {
    active: t('statusActive', lang),
    pending: t('statusPending', lang),
    completed: t('statusCompleted', lang),
    failed: t('statusFailed', lang),
    frozen: t('statusFrozen', lang),
    closed: t('statusClosed', lang),
    matched: t('statusMatched', lang),
    unmatched: t('statusUnmatched', lang),
    partial: t('statusPartial', lang),
    exception: t('statusException', lang),
  }
  return (
    <span class={`badge badge-${status}`} role="status" aria-label={labelMap[status] || status}>
      {labelMap[status] || status}
    </span>
  )
}

// ══════════════════════════════════════════════════
// FilterBar
// ══════════════════════════════════════════════════
interface FilterOption { value: string; label: string }
interface FilterField { name: string; label: string; type: 'select' | 'search' | 'date'; options?: FilterOption[] }

export function FilterBar({ tableId, fields, lang, onExport }: {
  tableId: string; fields: FilterField[]; lang: Lang; onExport?: boolean
}) {
  return (
    <div class="sc-filter-bar" role="search" aria-label={t('filter', lang)}>
      {fields.map((f, i) => {
        if (f.type === 'select') {
          return (
            <select
              aria-label={f.label}
              onchange={`SC.filterTable('${tableId}', ${i}, this.value)`}
            >
              <option value="">{f.label}</option>
              {f.options?.map(o => <option value={o.value}>{o.label}</option>)}
            </select>
          )
        }
        if (f.type === 'search') {
          return (
            <input
              type="search"
              placeholder={f.label}
              aria-label={f.label}
              oninput={`SC.searchTable('${tableId}', this.value)`}
            />
          )
        }
        if (f.type === 'date') {
          return (
            <input
              type="date"
              aria-label={f.label}
              onchange={`SC.filterTable('${tableId}', ${i}, this.value)`}
            />
          )
        }
        return null
      })}
      <button class="sc-btn sc-btn-secondary" onclick={`document.querySelectorAll('.sc-filter-bar select').forEach(s=>s.value='');document.querySelectorAll('.sc-filter-bar input').forEach(i=>i.value='');SC.searchTable('${tableId}','')`} aria-label={t('reset', lang)}>
        <i class="fas fa-undo" aria-hidden="true"></i> {t('reset', lang)}
      </button>
      {onExport && (
        <button class="sc-btn sc-btn-primary" onclick="SC.openModal('export-modal')" aria-label={t('export', lang)}>
          <i class="fas fa-download" aria-hidden="true"></i> {t('export', lang)}
        </button>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════
// DataTable (SSR rendered with sort/filter/paginate hooks)
// ══════════════════════════════════════════════════
interface Column {
  key: string
  label: string
  sortType?: 'text' | 'number'
  align?: 'left' | 'right' | 'center'
  width?: string
}

export function DataTable({ id, columns, children, lang, pageSize = 10 }: {
  id: string; columns: Column[]; children: any; lang: Lang; pageSize?: number
}) {
  return (
    <div class="sc-table-container">
      <div class="sc-table-wrap glass-card">
        <table id={id} class="sc-table" role="grid" aria-label={id}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  style={col.width ? { width: col.width } : {}}
                  class={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                  onclick={col.sortType ? `SC.sortTable('${id}', ${i}, '${col.sortType}')` : undefined}
                  aria-sort="none"
                  role="columnheader"
                  tabindex={col.sortType ? 0 : undefined}
                  onkeydown={col.sortType ? `if(event.key==='Enter')SC.sortTable('${id}',${i},'${col.sortType}')` : undefined}
                >
                  {col.label}
                  {col.sortType && <span class="sort-icon" aria-hidden="true">↕</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {children}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div class="sc-pagination" role="navigation" aria-label={t('page', lang)}>
        <span class="pag-info text-apple-secondary">1 / 1</span>
        <div class="flex gap-1">
          <button data-pag-prev disabled onclick={`var p=parseInt(this.closest('.sc-pagination').dataset.currentPage||'1');SC.goPage('${id}',p-1,${pageSize})`} aria-label={t('prev', lang)}>
            <i class="fas fa-chevron-left text-[11px]" aria-hidden="true"></i>
          </button>
          <button data-pag-next onclick={`var p=parseInt(this.closest('.sc-pagination').dataset.currentPage||'1');SC.goPage('${id}',p+1,${pageSize})`} aria-label={t('next', lang)}>
            <i class="fas fa-chevron-right text-[11px]" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      {/* Init pagination on load */}
      <script dangerouslySetInnerHTML={{__html: `
        document.addEventListener('DOMContentLoaded', function() { SC.goPage('${id}', 1, ${pageSize}); });
      `}} />
    </div>
  )
}

// ══════════════════════════════════════════════════
// Modal
// ══════════════════════════════════════════════════
export function Modal({ id, title, children, footer, lang }: {
  id: string; title: string; children: any; footer?: any; lang: Lang
}) {
  return (
    <div id={id} class="sc-modal-overlay" role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} onclick={`if(event.target===this)SC.closeModal('${id}')`}>
      <div class="sc-modal">
        <div class="sc-modal-header">
          <h3 id={`${id}-title`}>{title}</h3>
          <button class="sc-modal-close" data-modal-close onclick={`SC.closeModal('${id}')`} aria-label={t('close', lang)}>
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="sc-modal-body">
          {children}
        </div>
        {footer && (
          <div class="sc-modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// Drawer
// ══════════════════════════════════════════════════
export function Drawer({ id, title, children, lang, width }: {
  id: string; title: string; children: any; lang: Lang; width?: string
}) {
  return (
    <>
      <div id={`${id}-overlay`} class="sc-drawer-overlay" onclick={`SC.closeDrawer('${id}')`} aria-hidden="true"></div>
      <aside id={id} class="sc-drawer" style={width ? { width } : {}} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`}>
        <div class="sc-drawer-header">
          <h3 id={`${id}-title`}>{title}</h3>
          <button class="sc-modal-close" onclick={`SC.closeDrawer('${id}')`} aria-label={t('close', lang)}>
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="sc-drawer-body">
          {children}
        </div>
      </aside>
    </>
  )
}

// ══════════════════════════════════════════════════
// ExportModal (标准导出确认弹窗)
// ══════════════════════════════════════════════════
export function ExportModal({ lang }: { lang: Lang }) {
  return (
    <Modal
      id="export-modal"
      title={t('exportTitle', lang)}
      lang={lang}
      footer={
        <>
          <button class="sc-btn sc-btn-secondary" onclick="SC.closeModal('export-modal')">{t('cancel', lang)}</button>
          <button class="sc-btn sc-btn-primary" onclick={`SC.closeModal('export-modal');SC.toast('${t('exportSuccess', lang)}','success')`}>{t('confirm', lang)}</button>
        </>
      }
    >
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-[10px] bg-brand-light flex items-center justify-center flex-shrink-0">
          <i class="fas fa-file-export text-brand" aria-hidden="true"></i>
        </div>
        <p class="text-sm text-apple-secondary leading-relaxed">{t('exportMsg', lang)}</p>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════
// State: Loading
// ══════════════════════════════════════════════════
export function LoadingState({ lang }: { lang: Lang }) {
  return (
    <div class="py-12" role="status" aria-label={t('loading', lang)}>
      <div class="glass-card p-6 space-y-4">
        <div class="skeleton h-6 w-1/3"></div>
        <div class="skeleton h-4 w-2/3"></div>
        <div class="skeleton h-4 w-1/2"></div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {[1,2,3,4].map(() => <div class="skeleton h-24 rounded-xl"></div>)}
        </div>
        <div class="skeleton h-40 mt-4 rounded-xl"></div>
      </div>
      <p class="text-center text-apple-secondary text-sm mt-4">{t('loading', lang)}</p>
    </div>
  )
}

// ══════════════════════════════════════════════════
// State: Empty (带下一步引导)
// ══════════════════════════════════════════════════
export function EmptyState({ lang, message, actionLabel, actionHref, icon }: {
  lang: Lang; message: string; actionLabel?: string; actionHref?: string; icon?: string
}) {
  return (
    <div class="sc-empty" role="status">
      <div class="sc-empty-icon">
        <i class={`fas ${icon || 'fa-inbox'} text-brand`} aria-hidden="true"></i>
      </div>
      <p class="text-apple-secondary text-sm mb-1">{t('empty', lang)}</p>
      <p class="text-apple-tertiary text-xs mb-6 max-w-sm">{message}</p>
      {actionLabel && actionHref && (
        <a href={actionHref} class="sc-btn sc-btn-primary">
          <i class="fas fa-plus" aria-hidden="true"></i> {actionLabel}
        </a>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════
// State: Error
// ══════════════════════════════════════════════════
export function ErrorState({ lang }: { lang: Lang }) {
  return (
    <div class="sc-error" role="alert">
      <div class="w-16 h-16 rounded-2xl bg-[rgba(255,59,48,0.08)] flex items-center justify-center mb-4">
        <i class="fas fa-exclamation-triangle text-danger text-2xl" aria-hidden="true"></i>
      </div>
      <p class="text-apple-text font-medium mb-1">{t('error', lang)}</p>
      <p class="text-apple-tertiary text-xs mb-6">{lang === 'zh' ? '请检查网络连接或联系管理员' : 'Check your connection or contact support'}</p>
      <button class="sc-btn sc-btn-primary" onclick="location.reload()" aria-label={t('retry', lang)}>
        <i class="fas fa-redo" aria-hidden="true"></i> {t('retry', lang)}
      </button>
    </div>
  )
}

// ══════════════════════════════════════════════════
// ProgressBar
// ══════════════════════════════════════════════════
export function ProgressBar({ value, color }: { value: number; color?: string }) {
  const bg = color || '#5DC4B3'
  return (
    <div class="sc-progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div class="sc-progress-bar" style={{ width: `${value}%`, background: bg }}></div>
    </div>
  )
}

// ══════════════════════════════════════════════════
// InfoPair (key-value row)
// ══════════════════════════════════════════════════
export function InfoPair({ label, value }: { label: string; value: any }) {
  return (
    <div class="info-pair">
      <span class="info-label">{label}</span>
      <span class="info-value">{value}</span>
    </div>
  )
}

// ══════════════════════════════════════════════════
// StatCard (Dashboard用)
// ══════════════════════════════════════════════════
export function StatCard({ icon, iconBg, label, value, sub }: {
  icon: string; iconBg: string; label: string; value: string; sub?: string
}) {
  return (
    <div class="glass-card stat-card sc-transition">
      <div class="flex items-start justify-between mb-3">
        <div class="stat-icon" style={{ background: iconBg }}>
          <i class={`fas ${icon}`} style={{ color: 'white' }} aria-hidden="true"></i>
        </div>
        {sub && <span class="text-xs text-apple-tertiary">{sub}</span>}
      </div>
      <div class="stat-value">{value}</div>
      <div class="stat-label">{label}</div>
    </div>
  )
}
