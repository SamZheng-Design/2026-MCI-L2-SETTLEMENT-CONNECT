// ─────────────────────────────────────────────────
// Mock Data — 履约通 Settlement Connect
// 所有金额单位: CNY (元)
// 所有时间: ISO 8601 UTC, 展示时转 HKT
// ─────────────────────────────────────────────────

export interface UAC {
  id: string
  name: string
  type: 'settlement' | 'escrow' | 'transit'
  status: 'active' | 'pending' | 'frozen' | 'closed'
  balance: number
  allocated: number
  settled: number
  createdAt: string
  updatedAt: string
}

export interface AllocBatch {
  id: string
  uacId: string
  uacName: string
  date: string
  totalAmount: number
  count: number
  progress: number // 0-100
  status: 'pending' | 'completed' | 'failed'
  source: string
  operator: string
  approver: string
  items: AllocItem[]
}

export interface AllocItem {
  id: string
  target: string
  amount: number
  status: 'pending' | 'completed' | 'failed'
  remark: string
}

export interface ReconBatch {
  id: string
  date: string
  totalAmount: number
  matchedAmount: number
  unmatchedAmount: number
  matchRate: number
  status: 'matched' | 'unmatched' | 'partial' | 'exception'
  items: ReconItem[]
}

export interface ReconItem {
  id: string
  ref: string
  sysAmount: number
  bankAmount: number
  diff: number
  status: 'matched' | 'unmatched' | 'exception'
  date: string
}

export interface DashStats {
  totalUAC: number
  activeUAC: number
  totalAmount: number
  pendingCount: number
  completedCount: number
  failedCount: number
  settleRate: number
  avgHours: number
  trend: { date: string; amount: number; count: number }[]
  distribution: { status: string; count: number; color: string }[]
  recentActivity: { time: string; desc_zh: string; desc_en: string; type: string }[]
}

// ─── Dashboard Stats ──────────────────────────────
export const dashStats: DashStats = {
  totalUAC: 1247,
  activeUAC: 893,
  totalAmount: 358_600_000,
  pendingCount: 156,
  completedCount: 1034,
  failedCount: 57,
  settleRate: 92.7,
  avgHours: 4.2,
  trend: [
    { date: '2026-02-27T00:00:00Z', amount: 42_800_000, count: 78 },
    { date: '2026-02-28T00:00:00Z', amount: 51_200_000, count: 92 },
    { date: '2026-03-01T00:00:00Z', amount: 38_600_000, count: 65 },
    { date: '2026-03-02T00:00:00Z', amount: 67_400_000, count: 112 },
    { date: '2026-03-03T00:00:00Z', amount: 55_100_000, count: 98 },
    { date: '2026-03-04T00:00:00Z', amount: 48_900_000, count: 84 },
    { date: '2026-03-05T00:00:00Z', amount: 54_600_000, count: 91 },
  ],
  distribution: [
    { status: 'active', count: 893, color: '#5DC4B3' },
    { status: 'pending', count: 156, color: '#F5A623' },
    { status: 'completed', count: 1034, color: '#34C759' },
    { status: 'failed', count: 57, color: '#FF3B30' },
  ],
  recentActivity: [
    { time: '2026-03-05T06:30:00Z', desc_zh: 'UAC-2026-0891 完成结算 ¥120万', desc_en: 'UAC-2026-0891 settled ¥1.2M', type: 'success' },
    { time: '2026-03-05T05:45:00Z', desc_zh: '批次 AB-20260305-003 开始执行', desc_en: 'Batch AB-20260305-003 started', type: 'info' },
    { time: '2026-03-05T04:12:00Z', desc_zh: '对账批次 RC-0305 发现 3 笔差异', desc_en: 'Recon batch RC-0305 found 3 discrepancies', type: 'warning' },
    { time: '2026-03-05T03:00:00Z', desc_zh: 'UAC-2026-0742 创建成功', desc_en: 'UAC-2026-0742 created', type: 'info' },
    { time: '2026-03-04T22:30:00Z', desc_zh: '批次 AB-20260304-012 执行失败', desc_en: 'Batch AB-20260304-012 failed', type: 'error' },
  ],
}

// ─── UAC List ─────────────────────────────────────
export const uacList: UAC[] = [
  { id: 'UAC-2026-0001', name: '鑫源国际贸易有限公司', type: 'settlement', status: 'active', balance: 12_580_000, allocated: 8_200_000, settled: 7_800_000, createdAt: '2026-01-15T02:00:00Z', updatedAt: '2026-03-05T06:00:00Z' },
  { id: 'UAC-2026-0002', name: '华通科技集团', type: 'escrow', status: 'active', balance: 28_900_000, allocated: 15_600_000, settled: 12_400_000, createdAt: '2026-01-18T04:00:00Z', updatedAt: '2026-03-04T10:00:00Z' },
  { id: 'UAC-2026-0003', name: '恒达物流有限公司', type: 'transit', status: 'pending', balance: 5_600_000, allocated: 3_200_000, settled: 0, createdAt: '2026-02-01T06:00:00Z', updatedAt: '2026-03-03T08:00:00Z' },
  { id: 'UAC-2026-0004', name: '中盛矿业股份公司', type: 'settlement', status: 'active', balance: 45_200_000, allocated: 32_100_000, settled: 28_700_000, createdAt: '2026-01-08T01:00:00Z', updatedAt: '2026-03-05T04:00:00Z' },
  { id: 'UAC-2026-0005', name: '新纪元能源集团', type: 'escrow', status: 'frozen', balance: 18_700_000, allocated: 18_700_000, settled: 15_200_000, createdAt: '2026-01-22T03:00:00Z', updatedAt: '2026-03-01T12:00:00Z' },
  { id: 'UAC-2026-0006', name: '万邦进出口有限公司', type: 'settlement', status: 'active', balance: 9_800_000, allocated: 6_500_000, settled: 6_100_000, createdAt: '2026-02-10T05:00:00Z', updatedAt: '2026-03-05T02:00:00Z' },
  { id: 'UAC-2026-0007', name: '天润食品科技', type: 'transit', status: 'closed', balance: 0, allocated: 4_200_000, settled: 4_200_000, createdAt: '2025-11-20T08:00:00Z', updatedAt: '2026-02-28T09:00:00Z' },
  { id: 'UAC-2026-0008', name: '百汇投资管理有限公司', type: 'escrow', status: 'active', balance: 62_300_000, allocated: 41_800_000, settled: 38_500_000, createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-03-05T05:00:00Z' },
  { id: 'UAC-2026-0009', name: '远洋航运有限公司', type: 'settlement', status: 'pending', balance: 7_200_000, allocated: 0, settled: 0, createdAt: '2026-03-01T07:00:00Z', updatedAt: '2026-03-04T06:00:00Z' },
  { id: 'UAC-2026-0010', name: '金桥建设工程集团', type: 'transit', status: 'active', balance: 33_100_000, allocated: 22_400_000, settled: 19_800_000, createdAt: '2026-01-12T02:00:00Z', updatedAt: '2026-03-05T03:00:00Z' },
  { id: 'UAC-2026-0011', name: '丰泽农业发展有限公司', type: 'settlement', status: 'active', balance: 8_400_000, allocated: 5_600_000, settled: 4_900_000, createdAt: '2026-02-05T04:00:00Z', updatedAt: '2026-03-04T08:00:00Z' },
  { id: 'UAC-2026-0012', name: '星海医药科技', type: 'escrow', status: 'frozen', balance: 21_600_000, allocated: 21_600_000, settled: 18_300_000, createdAt: '2026-01-28T06:00:00Z', updatedAt: '2026-02-25T10:00:00Z' },
]

// ─── Allocation Batches ───────────────────────────
export const allocBatches: AllocBatch[] = [
  {
    id: 'AB-20260305-001', uacId: 'UAC-2026-0001', uacName: '鑫源国际贸易有限公司',
    date: '2026-03-05T02:00:00Z', totalAmount: 2_400_000, count: 4, progress: 75,
    status: 'pending', source: '主账户', operator: '张经理', approver: '李总监',
    items: [
      { id: 'AI-001-01', target: '供应商-深圳华信', amount: 800_000, status: 'completed', remark: '原材料货款' },
      { id: 'AI-001-02', target: '供应商-广州利达', amount: 600_000, status: 'completed', remark: '设备租赁费' },
      { id: 'AI-001-03', target: '物流-顺达运输', amount: 500_000, status: 'pending', remark: '运输费用' },
      { id: 'AI-001-04', target: '服务费-中介机构', amount: 500_000, status: 'pending', remark: '咨询服务费' },
    ],
  },
  {
    id: 'AB-20260304-012', uacId: 'UAC-2026-0004', uacName: '中盛矿业股份公司',
    date: '2026-03-04T08:00:00Z', totalAmount: 8_500_000, count: 3, progress: 33,
    status: 'failed', source: '托管子账户', operator: '王主管', approver: '陈总',
    items: [
      { id: 'AI-012-01', target: '矿产-西北矿业', amount: 5_000_000, status: 'failed', remark: '矿石采购款 - 账户异常' },
      { id: 'AI-012-02', target: '运输-铁路货运', amount: 2_000_000, status: 'pending', remark: '铁路运输费' },
      { id: 'AI-012-03', target: '保险-平安财险', amount: 1_500_000, status: 'completed', remark: '货运保险费' },
    ],
  },
  {
    id: 'AB-20260303-007', uacId: 'UAC-2026-0008', uacName: '百汇投资管理有限公司',
    date: '2026-03-03T04:00:00Z', totalAmount: 15_200_000, count: 5, progress: 100,
    status: 'completed', source: '主账户', operator: '赵经理', approver: '刘总',
    items: [
      { id: 'AI-007-01', target: '投资-项目A', amount: 5_000_000, status: 'completed', remark: '一期投资款' },
      { id: 'AI-007-02', target: '投资-项目B', amount: 3_200_000, status: 'completed', remark: '追加投资' },
      { id: 'AI-007-03', target: '管理费-基金', amount: 2_000_000, status: 'completed', remark: '基金管理费' },
      { id: 'AI-007-04', target: '税费-税务局', amount: 3_000_000, status: 'completed', remark: '企业所得税' },
      { id: 'AI-007-05', target: '审计-会计所', amount: 2_000_000, status: 'completed', remark: '年度审计费' },
    ],
  },
]

// ─── Reconciliation Batches ───────────────────────
export const reconBatches: ReconBatch[] = [
  {
    id: 'RC-20260305-001', date: '2026-03-05T00:00:00Z',
    totalAmount: 42_800_000, matchedAmount: 41_200_000, unmatchedAmount: 1_600_000,
    matchRate: 96.3, status: 'partial',
    items: [
      { id: 'RI-001-01', ref: 'TXN-20260305-A001', sysAmount: 800_000, bankAmount: 800_000, diff: 0, status: 'matched', date: '2026-03-05T01:00:00Z' },
      { id: 'RI-001-02', ref: 'TXN-20260305-A002', sysAmount: 1_200_000, bankAmount: 1_200_000, diff: 0, status: 'matched', date: '2026-03-05T02:00:00Z' },
      { id: 'RI-001-03', ref: 'TXN-20260305-A003', sysAmount: 500_000, bankAmount: 480_000, diff: 20_000, status: 'unmatched', date: '2026-03-05T03:00:00Z' },
      { id: 'RI-001-04', ref: 'TXN-20260305-A004', sysAmount: 3_000_000, bankAmount: 3_000_000, diff: 0, status: 'matched', date: '2026-03-05T04:00:00Z' },
      { id: 'RI-001-05', ref: 'TXN-20260305-A005', sysAmount: 1_600_000, bankAmount: 0, diff: 1_600_000, status: 'exception', date: '2026-03-05T05:00:00Z' },
    ],
  },
  {
    id: 'RC-20260304-001', date: '2026-03-04T00:00:00Z',
    totalAmount: 51_200_000, matchedAmount: 51_200_000, unmatchedAmount: 0,
    matchRate: 100, status: 'matched',
    items: [
      { id: 'RI-002-01', ref: 'TXN-20260304-B001', sysAmount: 5_000_000, bankAmount: 5_000_000, diff: 0, status: 'matched', date: '2026-03-04T01:00:00Z' },
      { id: 'RI-002-02', ref: 'TXN-20260304-B002', sysAmount: 8_200_000, bankAmount: 8_200_000, diff: 0, status: 'matched', date: '2026-03-04T02:00:00Z' },
      { id: 'RI-002-03', ref: 'TXN-20260304-B003', sysAmount: 2_000_000, bankAmount: 2_000_000, diff: 0, status: 'matched', date: '2026-03-04T03:00:00Z' },
    ],
  },
  {
    id: 'RC-20260303-001', date: '2026-03-03T00:00:00Z',
    totalAmount: 38_600_000, matchedAmount: 35_100_000, unmatchedAmount: 3_500_000,
    matchRate: 90.9, status: 'partial',
    items: [
      { id: 'RI-003-01', ref: 'TXN-20260303-C001', sysAmount: 3_500_000, bankAmount: 0, diff: 3_500_000, status: 'exception', date: '2026-03-03T01:00:00Z' },
      { id: 'RI-003-02', ref: 'TXN-20260303-C002', sysAmount: 12_000_000, bankAmount: 12_000_000, diff: 0, status: 'matched', date: '2026-03-03T02:00:00Z' },
    ],
  },
]
