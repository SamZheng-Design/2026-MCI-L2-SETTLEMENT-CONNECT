// ─────────────────────────────────────────────────
// 履约通 Settlement Connect — Main Router
// Hono SSR + JSX, all pages server-rendered
// ─────────────────────────────────────────────────
import { Hono } from 'hono'
import { renderer } from './renderer'
import { getLang } from './lib/i18n'
import type { Lang } from './lib/i18n'

// Pages
import { DashboardPage } from './pages/dashboard'
import { UACListPage } from './pages/uac'
import { AllocationListPage, AllocationDetailPage } from './pages/allocation'
import { ReconciliationPage } from './pages/reconciliation'

const app = new Hono()

// ── Global renderer middleware ──
app.use(renderer)

// ── Helper: extract lang from query ──
function lang(c: any): Lang {
  return getLang(c.req.query('lang'))
}

// ══════════════════════════════════════════════════
// Dashboard
// ══════════════════════════════════════════════════
app.get('/', (c) => {
  const l = lang(c)
  return c.render(
    <DashboardPage lang={l} />,
    { title: l === 'zh' ? '仪表盘' : 'Dashboard', lang: l, currentPath: '/' }
  )
})

// ══════════════════════════════════════════════════
// UAC List
// ══════════════════════════════════════════════════
app.get('/uac', (c) => {
  const l = lang(c)
  return c.render(
    <UACListPage lang={l} />,
    { title: l === 'zh' ? 'UAC 管理' : 'UAC Management', lang: l, currentPath: '/uac' }
  )
})

// ══════════════════════════════════════════════════
// Allocation Batch List
// ══════════════════════════════════════════════════
app.get('/allocation', (c) => {
  const l = lang(c)
  return c.render(
    <AllocationListPage lang={l} />,
    { title: l === 'zh' ? '分配批次' : 'Allocation Batch', lang: l, currentPath: '/allocation' }
  )
})

// ══════════════════════════════════════════════════
// Allocation Batch Detail
// ══════════════════════════════════════════════════
app.get('/allocation/:id', (c) => {
  const l = lang(c)
  const batchId = c.req.param('id')
  return c.render(
    <AllocationDetailPage batchId={batchId} lang={l} />,
    { title: batchId, lang: l, currentPath: '/allocation/' + batchId, showBack: true }
  )
})

// ══════════════════════════════════════════════════
// Reconciliation
// ══════════════════════════════════════════════════
app.get('/reconciliation', (c) => {
  const l = lang(c)
  return c.render(
    <ReconciliationPage lang={l} />,
    { title: l === 'zh' ? '对账管理' : 'Reconciliation', lang: l, currentPath: '/reconciliation' }
  )
})

// ══════════════════════════════════════════════════
// API: health check
// ══════════════════════════════════════════════════
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', name: 'Settlement Connect', timestamp: new Date().toISOString() })
})

export default app
