// ─────────────────────────────────────────────────
// Reconciliation — 对账管理
// a11y: aria-label on match rate bars, sortable tables,
//       modal confirm for auto-match, keyboard escape
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtAmount, fmtDate } from '../lib/i18n'
import { reconBatches } from '../lib/mock-data'
import type { ReconBatch } from '../lib/mock-data'
import {
  DataTable, FilterBar, StatusBadge, ExportModal, Modal,
  EmptyState, InfoPair, ProgressBar, StatCard,
} from '../components'

export function ReconciliationPage({ lang }: { lang: Lang }) {
  // Summary stats
  const totalRecon = reconBatches.reduce((s, b) => s + b.totalAmount, 0)
  const totalMatched = reconBatches.reduce((s, b) => s + b.matchedAmount, 0)
  const totalUnmatched = reconBatches.reduce((s, b) => s + b.unmatchedAmount, 0)
  const avgRate = reconBatches.length > 0
    ? Math.round(reconBatches.reduce((s, b) => s + b.matchRate, 0) / reconBatches.length * 10) / 10
    : 0

  const filterFields = [
    {
      name: 'status', label: t('reconFilterStatus', lang), type: 'select' as const,
      options: [
        { value: lang === 'zh' ? '已匹配' : 'Matched', label: t('statusMatched', lang) },
        { value: lang === 'zh' ? '未匹配' : 'Unmatched', label: t('statusUnmatched', lang) },
        { value: lang === 'zh' ? '部分匹配' : 'Partial Match', label: t('statusPartial', lang) },
        { value: lang === 'zh' ? '异常' : 'Exception', label: t('statusException', lang) },
      ]
    },
    { name: 'search', label: t('search', lang), type: 'search' as const },
  ]

  const batchColumns = [
    { key: 'id', label: t('reconBatchId', lang), sortType: 'text' as const },
    { key: 'date', label: t('reconDate', lang), sortType: 'text' as const },
    { key: 'total', label: t('reconTotal', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'matched', label: t('reconMatched', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'unmatched', label: t('reconUnmatched', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'rate', label: t('reconRate', lang), width: '120px' },
    { key: 'status', label: t('status', lang) },
    { key: 'actions', label: t('actions', lang), align: 'center' as const },
  ]

  return (
    <div>
      {/* Header */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('reconTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1">
            {t('total', lang)} {reconBatches.length} {lang === 'zh' ? '个批次' : 'batches'}
          </p>
        </div>
        <div class="flex gap-2">
          <button class="sc-btn sc-btn-primary" onclick="SC.openModal('auto-match-modal')" aria-label={t('reconAutoMatch', lang)}>
            <i class="fas fa-magic" aria-hidden="true"></i>
            {t('reconAutoMatch', lang)}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <section class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" aria-label={t('reconSummary', lang)}>
        <StatCard
          icon="fa-calculator"
          iconBg="linear-gradient(135deg, #5DC4B3, #4db3a2)"
          label={t('reconTotal', lang)}
          value={fmtAmount(totalRecon, lang)}
          sub="CNY"
        />
        <StatCard
          icon="fa-check-double"
          iconBg="linear-gradient(135deg, #34C759, #28a745)"
          label={t('reconMatched', lang)}
          value={fmtAmount(totalMatched, lang)}
        />
        <StatCard
          icon="fa-exclamation-circle"
          iconBg="linear-gradient(135deg, #FF9500, #e08600)"
          label={t('reconUnmatched', lang)}
          value={fmtAmount(totalUnmatched, lang)}
        />
        <StatCard
          icon="fa-percentage"
          iconBg="linear-gradient(135deg, #32ADE6, #2196c8)"
          label={t('reconRate', lang)}
          value={`${avgRate}%`}
          sub={lang === 'zh' ? '平均' : 'Average'}
        />
      </section>

      {/* ── Filter ── */}
      <FilterBar tableId="recon-table" fields={filterFields} lang={lang} onExport={true} />

      {/* ── Batch Table ── */}
      <DataTable id="recon-table" columns={batchColumns} lang={lang} pageSize={10}>
        {reconBatches.map((b) => {
          const rateColor = b.matchRate >= 98 ? '#34C759' : b.matchRate >= 90 ? '#F5A623' : '#FF3B30'
          return (
            <tr tabindex={0} aria-label={`${b.id}`}>
              <td class="font-mono text-xs text-brand">{b.id}</td>
              <td class="text-sm">{fmtDate(b.date, lang)}</td>
              <td class="text-right font-mono tabular-nums">{fmtAmount(b.totalAmount, lang)}</td>
              <td class="text-right font-mono tabular-nums text-success">{fmtAmount(b.matchedAmount, lang)}</td>
              <td class="text-right font-mono tabular-nums">
                {b.unmatchedAmount > 0 ? (
                  <span class="text-danger">{fmtAmount(b.unmatchedAmount, lang)}</span>
                ) : (
                  <span class="text-apple-tertiary">—</span>
                )}
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <div class="flex-1"><ProgressBar value={b.matchRate} color={rateColor} /></div>
                  <span class="text-xs font-medium w-10 text-right" style={{ color: rateColor }}>{b.matchRate}%</span>
                </div>
              </td>
              <td><StatusBadge status={b.status} lang={lang} /></td>
              <td class="text-center">
                <button
                  class="sc-btn sc-btn-ghost text-xs px-2"
                  onclick={`SC.showReconDetail('${b.id}')`}
                  aria-label={`${t('viewDetail', lang)} ${b.id}`}
                >
                  <i class="fas fa-chevron-right" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          )
        })}
      </DataTable>

      {/* ── Recon Detail Modal ── */}
      <div id="recon-detail-modal" class="sc-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="recon-detail-title" onclick="if(event.target===this)SC.closeModal('recon-detail-modal')">
        <div class="sc-modal" style={{ maxWidth: '720px' }}>
          <div class="sc-modal-header">
            <h3 id="recon-detail-title">{t('reconItems', lang)}</h3>
            <button class="sc-modal-close" onclick="SC.closeModal('recon-detail-modal')" aria-label={t('close', lang)}>
              <i class="fas fa-times" aria-hidden="true"></i>
            </button>
          </div>
          <div class="sc-modal-body" id="recon-detail-content">
            {/* Populated by JS */}
          </div>
        </div>
      </div>

      {/* ── Auto Match Confirm Modal ── */}
      <Modal
        id="auto-match-modal"
        title={t('reconAutoMatch', lang)}
        lang={lang}
        footer={
          <>
            <button class="sc-btn sc-btn-secondary" onclick="SC.closeModal('auto-match-modal')">{t('cancel', lang)}</button>
            <button class="sc-btn sc-btn-primary" onclick={`SC.closeModal('auto-match-modal');SC.toast('${lang === 'zh' ? '自动匹配任务已提交' : 'Auto match task submitted'}','success')`}>{t('confirm', lang)}</button>
          </>
        }
      >
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 rounded-[10px] bg-brand-light flex items-center justify-center flex-shrink-0">
            <i class="fas fa-magic text-brand" aria-hidden="true"></i>
          </div>
          <div>
            <p class="text-sm text-apple-secondary leading-relaxed">
              {lang === 'zh'
                ? '系统将自动匹配所有未匹配的对账记录，匹配规则基于金额、参考号和时间窗口。是否继续？'
                : 'The system will auto-match all unmatched records based on amount, reference, and time window. Continue?'}
            </p>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <ExportModal lang={lang} />

      {/* ── Inline JS ── */}
      <script dangerouslySetInnerHTML={{__html: `
        var reconData = ${JSON.stringify(reconBatches)};
        var lang = '${lang}';

        function fmtAmt(val) {
          if (lang === 'zh') {
            if (Math.abs(val)>=100000000) return '¥'+(val/100000000).toFixed(2)+'亿';
            if (Math.abs(val)>=10000) return '¥'+(val/10000).toFixed(0)+'万';
            return '¥'+val.toLocaleString('zh-CN');
          }
          if (Math.abs(val)>=1000000) return '¥'+(val/1000000).toFixed(2)+'M';
          if (Math.abs(val)>=1000) return '¥'+(val/1000).toFixed(0)+'K';
          return '¥'+val.toLocaleString('en-US');
        }

        SC.showReconDetail = function(id) {
          var batch = reconData.find(function(b) { return b.id === id; });
          if (!batch) return;

          var content = document.getElementById('recon-detail-content');
          if (!content) return;

          var statusMap = { matched: lang==='zh'?'已匹配':'Matched', unmatched: lang==='zh'?'未匹配':'Unmatched', exception: lang==='zh'?'异常':'Exception' };

          var html = '';
          // Batch summary
          html += '<div class="glass-card p-4 mb-4" style="background:rgba(93,196,179,0.04);border-color:rgba(93,196,179,0.12)">';
          html += '<div class="flex justify-between items-center"><span class="font-mono text-sm text-brand">' + batch.id + '</span>';
          html += '<span class="badge badge-' + batch.status + '">' + (statusMap[batch.status]||batch.status) + '</span></div>';
          html += '<div class="grid grid-cols-3 gap-4 mt-3">';
          html += '<div><div class="text-xs text-apple-secondary">' + (lang==='zh'?'总额':'Total') + '</div><div class="font-mono font-medium">' + fmtAmt(batch.totalAmount) + '</div></div>';
          html += '<div><div class="text-xs text-apple-secondary">' + (lang==='zh'?'已匹配':'Matched') + '</div><div class="font-mono font-medium text-success">' + fmtAmt(batch.matchedAmount) + '</div></div>';
          html += '<div><div class="text-xs text-apple-secondary">' + (lang==='zh'?'匹配率':'Rate') + '</div><div class="font-mono font-medium">' + batch.matchRate + '%</div></div>';
          html += '</div></div>';

          // Items table
          html += '<div class="sc-table-wrap" style="border-radius:12px;border:0.5px solid rgba(0,0,0,0.06)"><table class="sc-table" role="grid">';
          html += '<thead><tr>';
          html += '<th>' + (lang==='zh'?'参考号':'Reference') + '</th>';
          html += '<th style="text-align:right">' + (lang==='zh'?'系统金额':'System') + '</th>';
          html += '<th style="text-align:right">' + (lang==='zh'?'银行金额':'Bank') + '</th>';
          html += '<th style="text-align:right">' + (lang==='zh'?'差异':'Diff') + '</th>';
          html += '<th>' + (lang==='zh'?'状态':'Status') + '</th>';
          html += '</tr></thead><tbody>';

          batch.items.forEach(function(item) {
            var diffClass = item.diff > 0 ? 'text-danger font-medium' : 'text-apple-tertiary';
            html += '<tr>';
            html += '<td class="font-mono text-xs">' + item.ref + '</td>';
            html += '<td class="text-right font-mono tabular-nums">' + fmtAmt(item.sysAmount) + '</td>';
            html += '<td class="text-right font-mono tabular-nums">' + (item.bankAmount > 0 ? fmtAmt(item.bankAmount) : '—') + '</td>';
            html += '<td class="text-right font-mono tabular-nums ' + diffClass + '">' + (item.diff > 0 ? fmtAmt(item.diff) : '—') + '</td>';
            html += '<td><span class="badge badge-' + item.status + '">' + (statusMap[item.status]||item.status) + '</span></td>';
            html += '</tr>';
          });

          html += '</tbody></table></div>';
          content.innerHTML = html;
          SC.openModal('recon-detail-modal');
        };
      `}} />
    </div>
  )
}
