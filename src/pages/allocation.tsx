// ─────────────────────────────────────────────────
// Allocation Batch List + Detail
// a11y: progress bar aria-valuenow, table keyboard navigation
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtAmount, fmtDate } from '../lib/i18n'
import { allocBatches } from '../lib/mock-data'
import type { AllocBatch } from '../lib/mock-data'
import {
  DataTable, FilterBar, StatusBadge, ExportModal,
  EmptyState, InfoPair, ProgressBar, Modal,
} from '../components'

// ══════════════════════════════════════════════════
// Allocation Batch List
// ══════════════════════════════════════════════════
export function AllocationListPage({ lang }: { lang: Lang }) {
  const filterFields = [
    {
      name: 'status', label: t('status', lang), type: 'select' as const,
      options: [
        { value: lang === 'zh' ? '待处理' : 'Pending', label: t('statusPending', lang) },
        { value: lang === 'zh' ? '已完成' : 'Completed', label: t('statusCompleted', lang) },
        { value: lang === 'zh' ? '失败' : 'Failed', label: t('statusFailed', lang) },
      ]
    },
    { name: 'search', label: t('search', lang), type: 'search' as const },
  ]

  const columns = [
    { key: 'id', label: t('allocBatchId', lang), sortType: 'text' as const },
    { key: 'uac', label: t('uacName', lang), sortType: 'text' as const },
    { key: 'date', label: t('allocDate', lang), sortType: 'text' as const },
    { key: 'amount', label: t('allocTotalAmt', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'count', label: t('allocCount', lang), align: 'center' as const },
    { key: 'progress', label: t('allocProgress', lang), width: '140px' },
    { key: 'status', label: t('status', lang) },
    { key: 'actions', label: t('actions', lang), align: 'center' as const },
  ]

  return (
    <div>
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('allocListTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1">
            {t('total', lang)} {allocBatches.length} {t('items', lang)}
          </p>
        </div>
      </div>

      <FilterBar tableId="alloc-table" fields={filterFields} lang={lang} onExport={true} />

      <DataTable id="alloc-table" columns={columns} lang={lang} pageSize={10}>
        {allocBatches.map((b) => (
          <tr tabindex={0} aria-label={`${b.id} ${b.uacName}`}>
            <td class="font-mono text-xs text-brand">{b.id}</td>
            <td>
              <div class="font-medium text-sm">{b.uacName}</div>
              <div class="text-xs text-apple-tertiary font-mono">{b.uacId}</div>
            </td>
            <td class="text-apple-secondary text-xs">{fmtDate(b.date, lang)}</td>
            <td class="text-right font-mono tabular-nums">{fmtAmount(b.totalAmount, lang)}</td>
            <td class="text-center">{b.count}</td>
            <td>
              <div class="flex items-center gap-2">
                <ProgressBar value={b.progress} color={b.status === 'failed' ? '#FF3B30' : undefined} />
                <span class="text-xs font-medium w-8 text-right">{b.progress}%</span>
              </div>
            </td>
            <td><StatusBadge status={b.status} lang={lang} /></td>
            <td class="text-center">
              <a
                href={lang === 'en' ? `/allocation/${b.id}?lang=en` : `/allocation/${b.id}`}
                class="sc-btn sc-btn-ghost text-xs px-2"
                aria-label={`${t('viewDetail', lang)} ${b.id}`}
              >
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
              </a>
            </td>
          </tr>
        ))}
      </DataTable>

      <ExportModal lang={lang} />
    </div>
  )
}

// ══════════════════════════════════════════════════
// Allocation Batch Detail (by ID)
// ══════════════════════════════════════════════════
export function AllocationDetailPage({ batchId, lang }: { batchId: string; lang: Lang }) {
  const batch = allocBatches.find(b => b.id === batchId)

  if (!batch) {
    return (
      <EmptyState
        lang={lang}
        message={lang === 'zh' ? `未找到批次 ${batchId}` : `Batch ${batchId} not found`}
        actionLabel={t('allocGoToUAC', lang)}
        actionHref={lang === 'en' ? '/allocation?lang=en' : '/allocation'}
        icon="fa-search"
      />
    )
  }

  const itemColumns = [
    { key: 'id', label: t('allocItemId', lang), sortType: 'text' as const },
    { key: 'target', label: t('allocItemTarget', lang), sortType: 'text' as const },
    { key: 'amount', label: t('allocItemAmt', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'status', label: t('status', lang) },
    { key: 'remark', label: t('remark', lang) },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <nav class="flex items-center gap-2 text-sm text-apple-secondary mb-4" aria-label="Breadcrumb">
        <a href={lang === 'en' ? '/allocation?lang=en' : '/allocation'} class="hover:text-brand sc-transition">{t('allocListTitle', lang)}</a>
        <i class="fas fa-chevron-right text-[10px]" aria-hidden="true"></i>
        <span class="text-apple-text font-medium">{batch.id}</span>
      </nav>

      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('allocTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1 font-mono">{batch.id}</p>
        </div>
        <StatusBadge status={batch.status} lang={lang} />
      </div>

      {/* Info Cards */}
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="glass-card p-4">
          <div class="text-xs text-apple-secondary mb-1">{t('allocTotalAmt', lang)}</div>
          <div class="text-xl font-bold font-mono">{fmtAmount(batch.totalAmount, lang)}</div>
        </div>
        <div class="glass-card p-4">
          <div class="text-xs text-apple-secondary mb-1">{t('allocCount', lang)}</div>
          <div class="text-xl font-bold">{batch.count}</div>
        </div>
        <div class="glass-card p-4">
          <div class="text-xs text-apple-secondary mb-1">{t('allocDate', lang)}</div>
          <div class="text-sm font-medium">{fmtDate(batch.date, lang)}</div>
        </div>
        <div class="glass-card p-4">
          <div class="text-xs text-apple-secondary mb-1">{t('allocProgress', lang)}</div>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex-1"><ProgressBar value={batch.progress} color={batch.status === 'failed' ? '#FF3B30' : undefined} /></div>
            <span class="text-sm font-bold">{batch.progress}%</span>
          </div>
        </div>
      </div>

      {/* Batch Meta */}
      <div class="glass-card p-5 mb-6">
        <h2 class="text-base font-semibold mb-3">{lang === 'zh' ? '批次信息' : 'Batch Info'}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
          <InfoPair label={t('uacName', lang)} value={batch.uacName} />
          <InfoPair label={t('uacId', lang)} value={batch.uacId} />
          <InfoPair label={t('allocSource', lang)} value={batch.source} />
          <InfoPair label={t('allocOperator', lang)} value={batch.operator} />
          <InfoPair label={t('allocApprover', lang)} value={batch.approver} />
        </div>
      </div>

      {/* Allocation Items Table */}
      <h2 class="text-base font-semibold mb-3">{lang === 'zh' ? '分配明细' : 'Allocation Items'}</h2>
      <DataTable id="alloc-items-table" columns={itemColumns} lang={lang} pageSize={20}>
        {batch.items.map((item) => (
          <tr tabindex={0}>
            <td class="font-mono text-xs">{item.id}</td>
            <td class="font-medium">{item.target}</td>
            <td class="text-right font-mono tabular-nums">{fmtAmount(item.amount, lang)}</td>
            <td><StatusBadge status={item.status} lang={lang} /></td>
            <td class="text-apple-secondary text-xs">{item.remark}</td>
          </tr>
        ))}
      </DataTable>

      <ExportModal lang={lang} />
    </div>
  )
}
