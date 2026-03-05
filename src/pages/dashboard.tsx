// ─────────────────────────────────────────────────
// Dashboard — 运营概览
// a11y: aria-label on charts, landmark roles, keyboard nav
// ─────────────────────────────────────────────────
import type { Lang } from '../lib/i18n'
import { t, fmtAmount, fmtDate, fmtDateShort } from '../lib/i18n'
import { dashStats } from '../lib/mock-data'
import { StatCard, StatusBadge, EmptyState, ProgressBar } from '../components'

export function DashboardPage({ lang }: { lang: Lang }) {
  const s = dashStats

  return (
    <div>
      {/* Page header */}
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">{t('dashTitle', lang)}</h1>
          <p class="text-apple-secondary text-sm mt-1">
            {lang === 'zh' ? `数据更新至 ${fmtDate(new Date().toISOString(), lang)}` : `Updated ${fmtDate(new Date().toISOString(), lang)}`}
          </p>
        </div>
      </div>

      {/* ── Stat Cards (4-grid) ── */}
      <section aria-label={lang === 'zh' ? '核心指标' : 'Key Metrics'}>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            icon="fa-layer-group"
            iconBg="linear-gradient(135deg, #5DC4B3, #4db3a2)"
            label={t('dashTotalUAC', lang)}
            value={s.totalUAC.toLocaleString()}
            sub={`${t('dashActiveUAC', lang)}: ${s.activeUAC}`}
          />
          <StatCard
            icon="fa-coins"
            iconBg="linear-gradient(135deg, #F5A623, #e09510)"
            label={t('dashTotalAmt', lang)}
            value={fmtAmount(s.totalAmount, lang)}
            sub="CNY"
          />
          <StatCard
            icon="fa-chart-pie"
            iconBg="linear-gradient(135deg, #34C759, #28a745)"
            label={t('dashSettleRate', lang)}
            value={`${s.settleRate}%`}
            sub={`${s.completedCount} ${t('dashCompleted', lang)}`}
          />
          <StatCard
            icon="fa-clock"
            iconBg="linear-gradient(135deg, #32ADE6, #2196c8)"
            label={t('dashAvgTime', lang)}
            value={`${s.avgHours}`}
            sub={t('dashHours', lang)}
          />
        </div>
      </section>

      {/* ── 7-day Trend (SVG chart) ── */}
      <section class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div class="lg:col-span-2 glass-card p-5" aria-label={t('dashTrend', lang)}>
          <h2 class="text-base font-semibold mb-4">{t('dashTrend', lang)}</h2>
          <div class="overflow-x-auto">
            {renderTrendChart(s.trend, lang)}
          </div>
        </div>

        {/* Status distribution */}
        <div class="glass-card p-5" aria-label={t('dashDistrib', lang)}>
          <h2 class="text-base font-semibold mb-4">{t('dashDistrib', lang)}</h2>
          <div class="space-y-4">
            {s.distribution.map(d => {
              const pct = Math.round(d.count / s.totalUAC * 100)
              const statusKey = `status${d.status.charAt(0).toUpperCase() + d.status.slice(1)}` as any
              return (
                <div>
                  <div class="flex justify-between text-sm mb-1.5">
                    <span class="text-apple-secondary">{t(statusKey, lang)}</span>
                    <span class="font-medium">{d.count} <span class="text-apple-tertiary text-xs">({pct}%)</span></span>
                  </div>
                  <ProgressBar value={pct} color={d.color} />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Status summary cards (Pending / Completed / Failed) ── */}
      <section class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6" aria-label={lang === 'zh' ? '状态统计' : 'Status Stats'}>
        <div class="glass-card p-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[rgba(245,166,35,0.1)] flex items-center justify-center">
            <i class="fas fa-hourglass-half text-warning text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <div class="text-2xl font-bold">{s.pendingCount}</div>
            <div class="text-xs text-apple-secondary">{t('dashPending', lang)}</div>
          </div>
        </div>
        <div class="glass-card p-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[rgba(52,199,89,0.1)] flex items-center justify-center">
            <i class="fas fa-check-circle text-success text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <div class="text-2xl font-bold">{s.completedCount}</div>
            <div class="text-xs text-apple-secondary">{t('dashCompleted', lang)}</div>
          </div>
        </div>
        <div class="glass-card p-4 flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-[rgba(255,59,48,0.1)] flex items-center justify-center">
            <i class="fas fa-times-circle text-danger text-lg" aria-hidden="true"></i>
          </div>
          <div>
            <div class="text-2xl font-bold">{s.failedCount}</div>
            <div class="text-xs text-apple-secondary">{t('dashFailed', lang)}</div>
          </div>
        </div>
      </section>

      {/* ── Recent Activity ── */}
      <section class="glass-card p-5" aria-label={t('dashRecent', lang)}>
        <h2 class="text-base font-semibold mb-4">{t('dashRecent', lang)}</h2>
        <div class="space-y-0">
          {s.recentActivity.map((a, i) => {
            const typeIcon: Record<string, string> = {
              success: 'fa-check-circle text-success',
              info: 'fa-info-circle text-brand',
              warning: 'fa-exclamation-triangle text-warning',
              error: 'fa-times-circle text-danger',
            }
            return (
              <div class={`flex items-start gap-3 py-3 ${i < s.recentActivity.length - 1 ? 'border-b border-apple-divider' : ''}`}>
                <div class="mt-0.5">
                  <i class={`fas ${typeIcon[a.type] || typeIcon.info} text-sm`} aria-hidden="true"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm">{lang === 'zh' ? a.desc_zh : a.desc_en}</p>
                  <p class="text-xs text-apple-tertiary mt-0.5">{fmtDate(a.time, lang)}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

// ── SVG Trend Chart (pure SSR, no JS dependency) ──
function renderTrendChart(trend: typeof dashStats.trend, lang: Lang) {
  const W = 600, H = 200, PX = 40, PY = 20
  const chartW = W - PX * 2, chartH = H - PY * 2
  const maxAmt = Math.max(...trend.map(d => d.amount)) * 1.15
  const points = trend.map((d, i) => {
    const x = PX + (i / (trend.length - 1)) * chartW
    const y = PY + chartH - (d.amount / maxAmt) * chartH
    return { x, y, ...d }
  })
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `M${points[0].x},${PY + chartH} ${points.map(p => `L${p.x},${p.y}`).join(' ')} L${points[points.length-1].x},${PY + chartH} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} class="w-full" style={{ maxHeight: '220px' }} role="img" aria-label={lang === 'zh' ? '7日金额趋势图' : '7-day amount trend chart'}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map(pct => {
        const y = PY + chartH - pct * chartH
        return (
          <g>
            <line x1={PX} y1={y} x2={W - PX} y2={y} stroke="rgba(0,0,0,0.06)" stroke-width="0.5" />
            <text x={PX - 6} y={y + 4} text-anchor="end" fill="#86868b" font-size="9">
              {fmtAmount(Math.round(maxAmt * pct), lang)}
            </text>
          </g>
        )
      })}
      {/* Area fill */}
      <path d={areaPath} fill="url(#trendGrad)" opacity="0.3" />
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#5DC4B3" />
          <stop offset="100%" stop-color="#5DC4B3" stop-opacity="0" />
        </linearGradient>
      </defs>
      {/* Line */}
      <polyline points={polyline} fill="none" stroke="#5DC4B3" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      {/* Dots and labels */}
      {points.map(p => (
        <g>
          <circle cx={p.x} cy={p.y} r="4" fill="white" stroke="#5DC4B3" stroke-width="2" />
          <text x={p.x} y={PY + chartH + 14} text-anchor="middle" fill="#86868b" font-size="9">
            {fmtDateShort(p.date, lang)}
          </text>
        </g>
      ))}
    </svg>
  )
}
