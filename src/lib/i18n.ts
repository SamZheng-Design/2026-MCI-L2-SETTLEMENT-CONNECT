// ─────────────────────────────────────────────────
// 履约通 Settlement Connect — i18n 全量文案
// 默认 zh，?lang=en 切换
// 金额: CNY  中文 "¥68万"  英文 "¥680K"
// 时区: HKT / GMT+8
// ─────────────────────────────────────────────────

export type Lang = 'zh' | 'en'

export function getLang(query?: string): Lang {
  if (query === 'en') return 'en'
  return 'zh'
}

/** 切换语言后保留当前路径 */
export function langSwitchHref(currentPath: string, targetLang: Lang): string {
  const base = currentPath.split('?')[0]
  return targetLang === 'en' ? `${base}?lang=en` : base
}

// ─── 金额格式化 ─────────────────────────────────
export function fmtAmount(val: number, lang: Lang): string {
  if (lang === 'zh') {
    if (Math.abs(val) >= 100_000_000) return `¥${(val / 100_000_000).toFixed(2)}亿`
    if (Math.abs(val) >= 10_000) return `¥${(val / 10_000).toFixed(0)}万`
    return `¥${val.toLocaleString('zh-CN')}`
  }
  if (Math.abs(val) >= 1_000_000) return `¥${(val / 1_000_000).toFixed(2)}M`
  if (Math.abs(val) >= 1_000) return `¥${(val / 1_000).toFixed(0)}K`
  return `¥${val.toLocaleString('en-US')}`
}

// ─── 时间格式化 (HKT / GMT+8) ──────────────────
export function fmtDate(iso: string, lang: Lang): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  // 加 8 小时偏移
  const hkt = new Date(d.getTime() + 8 * 3600_000)
  const y = hkt.getUTCFullYear()
  const m = pad(hkt.getUTCMonth() + 1)
  const day = pad(hkt.getUTCDate())
  const h = pad(hkt.getUTCHours())
  const min = pad(hkt.getUTCMinutes())
  if (lang === 'zh') return `${y}年${m}月${day}日 ${h}:${min} HKT`
  return `${y}-${m}-${day} ${h}:${min} HKT`
}

export function fmtDateShort(iso: string, lang: Lang): string {
  const d = new Date(iso)
  const hkt = new Date(d.getTime() + 8 * 3600_000)
  const pad = (n: number) => String(n).padStart(2, '0')
  const m = pad(hkt.getUTCMonth() + 1)
  const day = pad(hkt.getUTCDate())
  if (lang === 'zh') return `${m}月${day}日`
  return `${m}-${day}`
}

// ─── TEXT 对象：全量文案 ──────────────────────────
export const TEXT = {
  // ── 通用 ──
  appName:        { zh: '履约通', en: 'Settlement Connect' },
  appSubtitle:    { zh: '智能履约管理平台', en: 'Intelligent Settlement Platform' },
  backToMain:     { zh: '返回主页', en: 'Back to Main' },
  langSwitch:     { zh: 'EN', en: '中文' },
  loading:        { zh: '正在加载...', en: 'Loading...' },
  error:          { zh: '加载失败，请稍后重试', en: 'Failed to load. Please try again later.' },
  retry:          { zh: '重新加载', en: 'Retry' },
  empty:          { zh: '暂无数据', en: 'No data yet' },
  confirm:        { zh: '确认', en: 'Confirm' },
  cancel:         { zh: '取消', en: 'Cancel' },
  close:          { zh: '关闭', en: 'Close' },
  export:         { zh: '导出', en: 'Export' },
  search:         { zh: '搜索', en: 'Search' },
  filter:         { zh: '筛选', en: 'Filter' },
  reset:          { zh: '重置', en: 'Reset' },
  total:          { zh: '共计', en: 'Total' },
  items:          { zh: '条', en: 'items' },
  page:           { zh: '页', en: 'Page' },
  prev:           { zh: '上一页', en: 'Previous' },
  next:           { zh: '下一页', en: 'Next' },
  sortAsc:        { zh: '升序', en: 'Ascending' },
  sortDesc:       { zh: '降序', en: 'Descending' },
  actions:        { zh: '操作', en: 'Actions' },
  viewDetail:     { zh: '查看详情', en: 'View Detail' },
  createdAt:      { zh: '创建时间', en: 'Created At' },
  updatedAt:      { zh: '更新时间', en: 'Updated At' },
  status:         { zh: '状态', en: 'Status' },
  amount:         { zh: '金额', en: 'Amount' },
  currency:       { zh: '币种', en: 'Currency' },
  cny:            { zh: '人民币 (CNY)', en: 'CNY' },
  description:    { zh: '描述', en: 'Description' },
  remark:         { zh: '备注', en: 'Remark' },
  id:             { zh: '编号', en: 'ID' },

  // ── 导出弹窗 ──
  exportTitle:    { zh: '确认导出', en: 'Confirm Export' },
  exportMsg:      { zh: '将导出当前筛选条件下的所有数据，是否继续？', en: 'All data matching current filters will be exported. Continue?' },
  exportSuccess:  { zh: '导出任务已提交', en: 'Export task submitted' },

  // ── Footer ──
  footerCopy:     { zh: `© ${new Date().getFullYear()} 履约通 Settlement Connect`, en: `© ${new Date().getFullYear()} Settlement Connect` },
  footerSlogan:   { zh: '让每一笔履约清晰可追溯', en: 'Every settlement, clear and traceable' },

  // ── Navbar ──
  navDashboard:   { zh: '仪表盘', en: 'Dashboard' },
  navUAC:         { zh: 'UAC 管理', en: 'UAC Management' },
  navAllocation:  { zh: '分配批次', en: 'Allocation Batch' },
  navRecon:       { zh: '对账', en: 'Reconciliation' },

  // ── Dashboard ──
  dashTitle:      { zh: '运营概览', en: 'Operations Overview' },
  dashTotalUAC:   { zh: 'UAC 总数', en: 'Total UACs' },
  dashActiveUAC:  { zh: '活跃 UAC', en: 'Active UACs' },
  dashTotalAmt:   { zh: '累计金额', en: 'Total Amount' },
  dashPending:    { zh: '待处理', en: 'Pending' },
  dashCompleted:  { zh: '已完成', en: 'Completed' },
  dashFailed:     { zh: '已失败', en: 'Failed' },
  dashTrend:      { zh: '近 7 日趋势', en: '7-Day Trend' },
  dashDistrib:    { zh: '状态分布', en: 'Status Distribution' },
  dashRecent:     { zh: '最近活动', en: 'Recent Activity' },
  dashEmptyGuide: { zh: '尚未创建任何 UAC，点击下方开始', en: 'No UACs created yet. Click below to start.' },
  dashCreateUAC:  { zh: '创建首个 UAC', en: 'Create First UAC' },
  dashSettleRate: { zh: '履约完成率', en: 'Settlement Rate' },
  dashAvgTime:    { zh: '平均处理时长', en: 'Avg Processing Time' },
  dashHours:      { zh: '小时', en: 'hours' },

  // ── UAC ──
  uacTitle:       { zh: 'UAC 列表', en: 'UAC List' },
  uacId:          { zh: 'UAC 编号', en: 'UAC ID' },
  uacName:        { zh: '客户名称', en: 'Client Name' },
  uacType:        { zh: '账户类型', en: 'Account Type' },
  uacBalance:     { zh: '账户余额', en: 'Balance' },
  uacAllocated:   { zh: '已分配金额', en: 'Allocated Amount' },
  uacSettled:     { zh: '已结算金额', en: 'Settled Amount' },
  uacCreated:     { zh: '开户时间', en: 'Open Date' },
  uacDetail:      { zh: 'UAC 详情', en: 'UAC Detail' },
  uacInfo:        { zh: '基本信息', en: 'Basic Info' },
  uacTimeline:    { zh: '操作时间线', en: 'Timeline' },
  uacRelatedBatch:{ zh: '关联批次', en: 'Related Batches' },
  uacFilterStatus:{ zh: '按状态筛选', en: 'Filter by Status' },
  uacFilterType:  { zh: '按类型筛选', en: 'Filter by Type' },
  uacEmptyGuide:  { zh: '暂无 UAC 数据，请先创建 UAC 或检查筛选条件', en: 'No UAC data. Create a UAC or adjust filters.' },
  uacCreateNew:   { zh: '新建 UAC', en: 'New UAC' },
  uacTypeSettlement: { zh: '结算账户', en: 'Settlement' },
  uacTypeEscrow:  { zh: '托管账户', en: 'Escrow' },
  uacTypeTransit: { zh: '过渡账户', en: 'Transit' },

  // ── Status ──
  statusActive:   { zh: '活跃', en: 'Active' },
  statusPending:  { zh: '待处理', en: 'Pending' },
  statusCompleted:{ zh: '已完成', en: 'Completed' },
  statusFailed:   { zh: '失败', en: 'Failed' },
  statusFrozen:   { zh: '冻结', en: 'Frozen' },
  statusClosed:   { zh: '已关闭', en: 'Closed' },
  statusMatched:  { zh: '已匹配', en: 'Matched' },
  statusUnmatched:{ zh: '未匹配', en: 'Unmatched' },
  statusPartial:  { zh: '部分匹配', en: 'Partial Match' },
  statusException:{ zh: '异常', en: 'Exception' },

  // ── Allocation Batch ──
  allocTitle:     { zh: '分配批次详情', en: 'Allocation Batch Detail' },
  allocBatchId:   { zh: '批次编号', en: 'Batch ID' },
  allocDate:      { zh: '分配日期', en: 'Allocation Date' },
  allocTotalAmt:  { zh: '批次总额', en: 'Batch Total' },
  allocCount:     { zh: '分配笔数', en: 'Allocation Count' },
  allocProgress:  { zh: '执行进度', en: 'Execution Progress' },
  allocSource:    { zh: '资金来源', en: 'Funding Source' },
  allocTarget:    { zh: '分配目标', en: 'Allocation Target' },
  allocItemId:    { zh: '明细编号', en: 'Item ID' },
  allocItemAmt:   { zh: '分配金额', en: 'Alloc Amount' },
  allocItemTarget:{ zh: '接收方', en: 'Recipient' },
  allocEmptyGuide:{ zh: '暂无分配批次，可从 UAC 发起新的分配', en: 'No batches yet. Start allocation from a UAC.' },
  allocGoToUAC:   { zh: '前往 UAC 管理', en: 'Go to UAC Management' },
  allocListTitle: { zh: '分配批次列表', en: 'Allocation Batch List' },
  allocOperator:  { zh: '操作人', en: 'Operator' },
  allocApprover:  { zh: '审批人', en: 'Approver' },

  // ── Reconciliation ──
  reconTitle:     { zh: '对账管理', en: 'Reconciliation' },
  reconBatchId:   { zh: '对账批次', en: 'Recon Batch' },
  reconDate:      { zh: '对账日期', en: 'Recon Date' },
  reconTotal:     { zh: '对账总额', en: 'Recon Total' },
  reconMatched:   { zh: '已匹配金额', en: 'Matched Amount' },
  reconUnmatched: { zh: '未匹配金额', en: 'Unmatched Amount' },
  reconRate:      { zh: '匹配率', en: 'Match Rate' },
  reconItems:     { zh: '对账明细', en: 'Recon Items' },
  reconSysAmt:    { zh: '系统金额', en: 'System Amount' },
  reconBankAmt:   { zh: '银行金额', en: 'Bank Amount' },
  reconDiff:      { zh: '差异金额', en: 'Difference' },
  reconRef:       { zh: '参考号', en: 'Reference' },
  reconEmptyGuide:{ zh: '暂无对账记录，请先完成分配流程后再进行对账', en: 'No recon records. Complete allocation first.' },
  reconGoAlloc:   { zh: '前往分配批次', en: 'Go to Allocation' },
  reconSummary:   { zh: '对账汇总', en: 'Recon Summary' },
  reconException: { zh: '异常处理', en: 'Exception Handling' },
  reconAutoMatch: { zh: '自动匹配', en: 'Auto Match' },
  reconManual:    { zh: '人工对账', en: 'Manual Recon' },
  reconFilterDate:{ zh: '按日期筛选', en: 'Filter by Date' },
  reconFilterStatus:{ zh: '按匹配状态筛选', en: 'Filter by Match Status' },

  // ── Toast ──
  toastSuccess:   { zh: '操作成功', en: 'Success' },
  toastError:     { zh: '操作失败', en: 'Error' },
  toastWarning:   { zh: '请注意', en: 'Warning' },
  toastInfo:      { zh: '提示', en: 'Info' },
} as const

export type TextKey = keyof typeof TEXT

/** 取文案 */
export function t(key: TextKey, lang: Lang): string {
  return TEXT[key]?.[lang] ?? TEXT[key]?.['zh'] ?? key
}
