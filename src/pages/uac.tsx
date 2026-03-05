// ─────────────────────────────────────────────────
// UAC List + Detail (Drawer)
// a11y: sortable th keyboard, drawer focus trap, aria-sort
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtAmount, fmtDate } from '../lib/i18n'
import { uacList, allocBatches } from '../lib/mock-data'
import type { UAC } from '../lib/mock-data'
import {
  DataTable, FilterBar, StatusBadge, Drawer, ExportModal,
  EmptyState, InfoPair, ProgressBar,
} from '../components'

export function UACListPage({ lang }: { lang: Lang }) {
  const typeLabel = (t_: string) => {
    const map: Record<string, string> = {
      settlement: lang === 'zh' ? '结算账户' : 'Settlement',
      escrow: lang === 'zh' ? '托管账户' : 'Escrow',
      transit: lang === 'zh' ? '过渡账户' : 'Transit',
    }
    return map[t_] || t_
  }

  const filterFields = [
    {
      name: 'status', label: t('uacFilterStatus', lang), type: 'select' as const,
      options: [
        { value: lang === 'zh' ? '活跃' : 'Active', label: t('statusActive', lang) },
        { value: lang === 'zh' ? '待处理' : 'Pending', label: t('statusPending', lang) },
        { value: lang === 'zh' ? '冻结' : 'Frozen', label: t('statusFrozen', lang) },
        { value: lang === 'zh' ? '已关闭' : 'Closed', label: t('statusClosed', lang) },
      ]
    },
    {
      name: 'type', label: t('uacFilterType', lang), type: 'select' as const,
      options: [
        { value: lang === 'zh' ? '结算账户' : 'Settlement', label: t('uacTypeSettlement', lang) },
        { value: lang === 'zh' ? '托管账户' : 'Escrow', label: t('uacTypeEscrow', lang) },
        { value: lang === 'zh' ? '过渡账户' : 'Transit', label: t('uacTypeTransit', lang) },
      ]
    },
    { name: 'search', label: t('search', lang), type: 'search' as const },
  ]

  const columns = [
    { key: 'id', label: t('uacId', lang), sortType: 'text' as const },
    { key: 'name', label: t('uacName', lang), sortType: 'text' as const },
    { key: 'type', label: t('uacType', lang) },
    { key: 'status', label: t('status', lang) },
    { key: 'balance', label: t('uacBalance', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'settled', label: t('uacSettled', lang), sortType: 'number' as const, align: 'right' as const },
    { key: 'created', label: t('uacCreated', lang), sortType: 'text' as const },
    { key: 'actions', label: t('actions', lang), align: 'center' as const },
  ]

  return (
    <div>
      {/* Header */}
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('uacTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1">
            {t('total', lang)} {uacList.length} {t('items', lang)}
          </p>
        </div>
      </div>

      {/* Filter */}
      <FilterBar tableId="uac-table" fields={filterFields} lang={lang} onExport={true} />

      {/* Table */}
      <DataTable id="uac-table" columns={columns} lang={lang} pageSize={8}>
        {uacList.map((u) => (
          <tr tabindex={0} aria-label={`${u.id} ${u.name}`}>
            <td class="font-mono text-xs text-brand">{u.id}</td>
            <td class="font-medium">{u.name}</td>
            <td>{typeLabel(u.type)}</td>
            <td><StatusBadge status={u.status} lang={lang} /></td>
            <td class="text-right font-mono tabular-nums">{fmtAmount(u.balance, lang)}</td>
            <td class="text-right font-mono tabular-nums">{fmtAmount(u.settled, lang)}</td>
            <td class="text-apple-secondary text-xs">{fmtDate(u.createdAt, lang)}</td>
            <td class="text-center">
              <button
                class="sc-btn sc-btn-ghost text-xs px-2"
                onclick={`SC.showUACDetail('${u.id}')`}
                aria-label={`${t('viewDetail', lang)} ${u.id}`}
              >
                <i class="fas fa-chevron-right" aria-hidden="true"></i>
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* ── UAC Detail Drawer ── */}
      <Drawer id="uac-drawer" title={t('uacDetail', lang)} lang={lang}>
        <div id="uac-detail-content">
          {/* Populated by inline JS */}
        </div>
      </Drawer>

      {/* Export Modal */}
      <ExportModal lang={lang} />

      {/* ── Inline JS for UAC detail ── */}
      <script dangerouslySetInnerHTML={{__html: `
        var uacData = ${JSON.stringify(uacList)};
        var allocData = ${JSON.stringify(allocBatches.map(b => ({ id: b.id, uacId: b.uacId, date: b.date, totalAmount: b.totalAmount, status: b.status, progress: b.progress })))};
        var lang = '${lang}';

        SC.showUACDetail = function(id) {
          var u = uacData.find(function(x) { return x.id === id; });
          if (!u) return;
          var batches = allocData.filter(function(b) { return b.uacId === id; });
          var content = document.getElementById('uac-detail-content');
          if (!content) return;

          var typeMap = { settlement: lang==='zh'?'结算账户':'Settlement', escrow: lang==='zh'?'托管账户':'Escrow', transit: lang==='zh'?'过渡账户':'Transit' };
          var statusMap = { active: lang==='zh'?'活跃':'Active', pending: lang==='zh'?'待处理':'Pending', frozen: lang==='zh'?'冻结':'Frozen', closed: lang==='zh'?'已关闭':'Closed' };

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

          var html = '<div class="space-y-5">';
          // Header
          html += '<div class="flex items-center gap-3 pb-4 border-b border-apple-divider">';
          html += '<div class="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center"><i class="fas fa-user-circle text-brand text-lg"></i></div>';
          html += '<div><div class="font-semibold">' + u.name + '</div>';
          html += '<div class="text-xs text-apple-tertiary font-mono">' + u.id + '</div></div></div>';

          // Info section
          html += '<h4 class="text-sm font-semibold text-apple-secondary">' + (lang==='zh'?'基本信息':'Basic Info') + '</h4>';
          html += '<div class="info-pair"><span class="info-label">' + (lang==='zh'?'账户类型':'Type') + '</span><span class="info-value">' + (typeMap[u.type]||u.type) + '</span></div>';
          html += '<div class="info-pair"><span class="info-label">' + (lang==='zh'?'状态':'Status') + '</span><span class="info-value"><span class="badge badge-' + u.status + '">' + (statusMap[u.status]||u.status) + '</span></span></div>';
          html += '<div class="info-pair"><span class="info-label">' + (lang==='zh'?'账户余额':'Balance') + '</span><span class="info-value font-mono">' + fmtAmt(u.balance) + '</span></div>';
          html += '<div class="info-pair"><span class="info-label">' + (lang==='zh'?'已分配':'Allocated') + '</span><span class="info-value font-mono">' + fmtAmt(u.allocated) + '</span></div>';
          html += '<div class="info-pair"><span class="info-label">' + (lang==='zh'?'已结算':'Settled') + '</span><span class="info-value font-mono">' + fmtAmt(u.settled) + '</span></div>';

          // Progress
          var pct = u.allocated > 0 ? Math.round(u.settled / u.allocated * 100) : 0;
          html += '<div class="mt-2"><div class="flex justify-between text-xs mb-1"><span class="text-apple-secondary">' + (lang==='zh'?'结算进度':'Settlement Progress') + '</span><span class="font-medium">' + pct + '%</span></div>';
          html += '<div class="sc-progress"><div class="sc-progress-bar" style="width:' + pct + '%;background:#5DC4B3"></div></div></div>';

          // Related batches
          if (batches.length > 0) {
            html += '<h4 class="text-sm font-semibold text-apple-secondary mt-4">' + (lang==='zh'?'关联批次':'Related Batches') + '</h4>';
            batches.forEach(function(b) {
              var sColor = b.status==='completed'?'completed':b.status==='failed'?'failed':'pending';
              html += '<a href="' + (lang==='en'?'/allocation/'+b.id+'?lang=en':'/allocation/'+b.id) + '" class="block glass-card p-3 mb-2 no-underline text-apple-text hover:shadow-card-hover sc-transition">';
              html += '<div class="flex justify-between items-center"><span class="font-mono text-xs text-brand">' + b.id + '</span><span class="badge badge-' + sColor + '">' + b.status + '</span></div>';
              html += '<div class="text-sm font-medium mt-1">' + fmtAmt(b.totalAmount) + '</div>';
              html += '<div class="sc-progress mt-2"><div class="sc-progress-bar" style="width:' + b.progress + '%;background:' + (sColor==='failed'?'#FF3B30':'#5DC4B3') + '"></div></div>';
              html += '</a>';
            });
          }

          html += '</div>';
          content.innerHTML = html;
          SC.openDrawer('uac-drawer');
        };
      `}} />
    </div>
  )
}
