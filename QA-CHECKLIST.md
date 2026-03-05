# 履约通 Settlement Connect - 验收清单 & 测试用例

> 文档版本: v1.0 | 日期: 2026-03-05 | 适用分支: main
> 系统架构: Hono + Cloudflare Pages | 前端: SSR + TailwindCSS CDN
> 数据层: 当前 Mock (内存) | 生产目标: Cloudflare D1

---

## 一、验收清单 (Acceptance Checklist)

### A. 视觉一致性 (Visual Consistency)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| A-1 | **禁纯黑** | 全站文字最深色为 `#1d1d1f`，禁止使用 `#000000` / `rgb(0,0,0)` | `grep -r "#000000\|rgb(0,0,0)\|color: black" src/ public/` | style.css 已设 body color:#1d1d1f |
| A-2 | **品牌色一致** | 主色 `#5DC4B3`；所有交互态 (hover/focus/active) 使用品牌色衍生色 | 人工检查所有 `.sc-btn-primary`、`.badge-active`、focus-visible outline | style.css 定义完备 |
| A-3 | **Navbar 固定毛玻璃** | 顶部 56px 固定，`backdrop-filter: blur(20px)`，底部 0.5px 分割线 | 滚动页面验证 Navbar 不抖动、毛玻璃效果存在 | `.sc-navbar` 已实现 |
| A-4 | **Footer Aurora** | 深色渐变背景 + aurora 动效 12s infinite alternate | 验证 `@keyframes aurora` 存在且 Footer 非纯黑 | `.sc-footer` 有动画 |
| A-5 | **过渡动效 280ms** | 所有可交互元素使用 280ms cubic-bezier(0.25,0.1,0.25,1) | 检查 `.sc-transition` 及全局 `a, button, input, select` 过渡声明 | style.css 全局定义 |
| A-6 | **Glass Card** | 卡片使用 `backdrop-filter: blur(16px)` + 半透明白底 + 圆角 16px | 各页面 `.glass-card` 视觉抽查 | 已实现 |
| A-7 | **StatusBadge 颜色体系** | 10 种状态 (active/pending/completed/failed/frozen/closed/matched/unmatched/partial/exception) 各有独立色值 | 对照 style.css `.badge-*` 定义 | 10 种已定义 |
| A-8 | **响应式断点** | 768px 以下 Drawer 全屏、表格字号缩小、内边距调整 | Chrome DevTools 模拟 375px / 768px | `@media (max-width: 768px)` 已覆盖 |

### B. 国际化 (i18n)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| B-1 | **?lang=en 全覆盖** | 所有页面 (/, /uac, /allocation, /allocation/:id, /reconciliation, /audit, /login) 加 `?lang=en` 后无中文泄漏 | 逐页面访问 `?lang=en`，搜索中文字符 | TEXT 对象 80+ key 双语 |
| B-2 | **默认中文** | 无 `?lang=en` 参数时默认展示中文 | 直接访问根路径验证 | `getLang()` 默认返回 'zh' |
| B-3 | **金额格式-中文** | `>=10万` 显示 `¥XX万`，`>=1亿` 显示 `¥X.XX亿` | 验证 `fmtAmount(12580000, 'zh')` => `¥1258万` | `fmtAmount()` 已实现 |
| B-4 | **金额格式-英文** | `>=1K` 显示 `¥XXK`，`>=1M` 显示 `¥X.XXM` | 验证 `fmtAmount(12580000, 'en')` => `¥12.58M` | `fmtAmount()` 已实现 |
| B-5 | **时间格式-HKT** | 所有时间显示为 HKT (GMT+8)，中文 `YYYY年MM月DD日 HH:MM HKT`，英文 `YYYY-MM-DD HH:MM HKT` | 取 UTC 时间 `2026-03-05T06:00:00Z` 应显示为 14:00 HKT | `fmtDate()` 手动 +8h |
| B-6 | **语言切换保持路径** | 从 `/allocation/AB-20260305-001` 切换语言后 URL 变为 `/allocation/AB-20260305-001?lang=en` | 验证 `langSwitchHref()` 保留 pathname | 已实现 |
| B-7 | **登录页双语** | 登录错误提示、演示账号区、session 过期提示均有双语 | 访问 `/login?lang=en` 和 `/login?expired=1&lang=en` | TEXT 中已定义 |

### C. 领域正确性 (Domain Correctness)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| C-1 | **UAC 编号规则** | 格式 `UAC-YYYY-NNNN`，全局唯一，年份 = 创建年 | 检查 `uacList` 所有 id 符合正则 `^UAC-\d{4}-\d{4}$` | Mock 数据 12 条合规 |
| C-2 | **TPC 关联** | (待实现) 每个 UAC 应关联 1+ TPC (Third Party Counterpart)；TPC 无持有人映射时进入异常队列 | 当前 mock 未含 TPC 实体；**GAP: 需增加 TPC 数据模型** | **缺失 - 需补建** |
| C-3 | **IA 编号规则** | (待实现) 格式 `IA-YYYYMMDD-NNN`，关联 UAC + TPC | 当前 mock 未含 IA (Investment Agreement) 实体；**GAP: 需增加** | **缺失 - 需补建** |
| C-4 | **Batch 编号规则** | 格式 `AB-YYYYMMDD-NNN` (Allocation Batch) | 检查 `allocBatches` 所有 id 符合 `^AB-\d{8}-\d{3}$` | Mock 3 条合规 |
| C-5 | **每日分账明细必备字段** | 每条分账明细须包含: `uac_id`, `tpc_id`, `ia_id`, `batch_id`, `source_txn_id` | 当前 `AllocItem` 仅含 `id, target, amount, status, remark`；**GAP: 缺 uac_id/tpc_id/ia_id/source_txn_id** | **部分缺失 - 需扩展** |
| C-6 | **Recon 编号规则** | 格式 `RC-YYYYMMDD-NNN` (Reconciliation Batch) | 检查 `reconBatches` 所有 id 符合 `^RC-\d{8}-\d{3}$` | Mock 3 条合规 |
| C-7 | **Recon Item 参考号** | 格式 `TXN-YYYYMMDD-AXXX` | 检查 `reconBatches[*].items[*].ref` 合规 | Mock 数据合规 |

### D. 幂等与重跑 (Idempotency & Rerun)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| D-1 | **同日同UAC重复计算** | 对同一 UAC 在同一日期执行两次分账计算，应生成同一 batch_id 或阻止重复出明细 | API: `POST /api/allocation/calculate { uac_id, date }` 调用两次 → 第二次返回 409 或幂等复用 | **待实现 (当前 Mock 无写入 API)** |
| D-2 | **Batch 重跑** | 对 failed batch 执行重跑，应复用原 batch_id，明细状态重置为 pending | API: `POST /api/allocation/:batch_id/rerun` → 验证明细不重复生成 | **待实现** |
| D-3 | **请求幂等键** | 所有写操作 API 应支持 `Idempotency-Key` header | 检查 API 中间件是否拦截重复 key | **待实现** |

### E. 异常处理 (Exception Handling)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| E-1 | **TPC 无持有人映射** | 当某 TPC 缺少持有人 (beneficiary) 映射时，该 TPC 相关分配进入异常队列，状态标记为 `exception` | 构造无 beneficiary 的 TPC → 执行分配 → 检查异常队列 | **待实现 (需 TPC + 异常队列)** |
| E-2 | **批次 partial_failed** | 当批次中部分明细 failed、部分 completed，批次状态应为 `partial_failed` | 当前 AllocBatch.status 仅有 `pending|completed|failed`；**GAP: 需增加 partial_failed** | **部分缺失** |
| E-3 | **Chain JWT 失败处理** | 上游 JWT 验证失败 → 展示错误页面 + 返回上游链接 + 独立登录入口 | 访问 `/?from=main&token=invalid_token` | 已实现 (index.tsx L106-133) |
| E-4 | **Session 过期** | Token 过期后访问受保护页面 → 重定向 `/login?expired=1` + 清除 Cookie | 等待 token 过期或手动改 exp → 访问 / | 已实现 (index.tsx L320-327) |
| E-5 | **404 路由** | 访问不存在的路由返回友好 404 | 访问 `/nonexistent` | 当前走 Hono 默认 404 |
| E-6 | **批次详情 404** | 访问不存在的 batch → EmptyState 引导 | 访问 `/allocation/AB-99999999-999` | 已实现 (allocation.tsx L96-106) |

### F. 银行指令导出 (Bank Instruction Export)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| F-1 | **CSV 导出内容一致** | 导出 CSV 字段须与页面表格明细一一对应 (batch_id/item_id/target/amount/status/remark) | 导出后逐行比对页面表格 | **待实现 (当前 Export 仅 UI 确认弹窗)** |
| F-2 | **JSON 导出内容一致** | JSON 导出结构须包含完整 batch 元数据 + items 数组 | 导出 JSON → 验证 schema 与 AllocBatch interface 一致 | **待实现** |
| F-3 | **金额精度** | 导出文件中金额为分级整数 (CNY 元)，非格式化字符串 | 检查 CSV/JSON 金额字段为 number 类型，非 `¥1258万` | **待实现** |
| F-4 | **回执导入** | 银行回执文件 (CSV) 导入后，对应明细状态从 pending → completed/failed | API: `POST /api/allocation/:batch_id/receipt` + CSV body | **待实现** |
| F-5 | **回执导入后状态更新** | 导入回执后批次状态自动更新 (全部成功→completed, 部分→partial_failed) | 验证 batch.status 联动更新 | **待实现** |

### G. 对账 (Reconciliation)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| G-1 | **应付 vs 已付差异** | 当 sysAmount != bankAmount，diff 字段正确计算且状态标记 unmatched/exception | 检查 `reconBatches[*].items` 中 diff = sysAmount - bankAmount | Mock 数据正确 |
| G-2 | **差错单生成** | 对 unmatched/exception 的 ReconItem 能一键生成差错单 | UI: 对账明细 Modal 中有差错单入口；API: `POST /api/recon/:id/dispute` | **UI 部分呈现，API 待实现** |
| G-3 | **匹配率计算** | `matchRate = matchedAmount / totalAmount * 100`，保留1位小数 | 检查 RC-20260305-001: 41200000/42800000*100 = 96.26... ≈ 96.3% | Mock 数据正确 |
| G-4 | **自动匹配** | 自动匹配按钮触发匹配流程，基于金额+参考号+时间窗口 | 点击 "自动匹配" → 确认弹窗 → 执行 | UI 弹窗已实现，后端逻辑待实现 |
| G-5 | **对账批次状态** | matched (100%)/partial (>0 & <100%)/unmatched (0%)/exception (含异常项) | 检查 3 个 mock 批次状态是否正确 | RC-0305: partial ✓, RC-0304: matched ✓, RC-0303: partial ✓ |

### H. 审计 (Audit)

| # | 检查项 | 验收标准 | 测试方法 | 当前状态 |
|---|--------|----------|----------|----------|
| H-1 | **所有写操作记录** | login/logout/chain_entry/page_view 均写入 audit_logs | 执行各操作后访问 `/audit` 检查日志 | 已实现 (auth.ts writeAuditLog) |
| H-2 | **Token 不入日志** | 完整 token 不会出现在 audit_logs 的任何字段中 | 检查 AuditLogEntry interface，仅含 token_fp (SHA-256 前8位) | 已实现 |
| H-3 | **按 UAC 查询链路** | (待实现) 输入 UAC ID → 查出该 UAC 相关所有操作 (创建/分配/对账/异常) | API: `GET /api/audit?uac_id=UAC-2026-0001` | **待实现 (当前 audit 无 UAC 维度)** |
| H-4 | **按 TPC 查询链路** | (待实现) 输入 TPC ID → 查出该 TPC 相关所有分配和对账 | API: `GET /api/audit?tpc_id=...` | **待实现** |
| H-5 | **按 IA 查询链路** | (待实现) 输入 IA ID → 查出该 IA 的完整生命周期 | API: `GET /api/audit?ia_id=...` | **待实现** |
| H-6 | **Chain 模式审计增强** | Chain 模式的审计日志须包含 source_app、entry_time、token_fp | 链路模式登录后检查审计日志的 chain_context 字段 | 已实现 |
| H-7 | **日志不可篡改** | (生产要求) 日志写入后不可修改/删除 | 当前内存存储可改；D1 迁移后应设 append-only | **待实现 (依赖 D1 迁移)** |
| H-8 | **审计日志分页** | 支持分页查询，默认最新 100 条 | 访问 `/audit` 验证 DataTable 分页功能 | 已实现 (pageSize=15) |

---

## 二、最小测试用例 (Minimum Test Cases)

> 格式: Given / When / Then
> 类型标记: [手测] = 可手动执行 | [自动] = 可用 curl/playwright 自动化
> 优先级: P0 = 阻断性 | P1 = 核心 | P2 = 增强

---

### TC-01: 视觉-禁纯黑验证 [自动] P1

```
Given   项目 CSS 文件 public/static/style.css 已加载
When    使用 grep 搜索 src/ 和 public/ 目录下所有文件中的 "#000000"、"rgb(0,0,0)"、"color: black"、"color:black"
Then    搜索结果为空 (0 matches)
        且 body 的 color 值为 #1d1d1f
```

**自动化脚本:**
```bash
# 验证无纯黑
result=$(grep -rn "#000000\|rgb(0,0,0)\|color: black\|color:black" src/ public/ 2>/dev/null | grep -v node_modules | grep -v ".git")
[ -z "$result" ] && echo "PASS: 无纯黑" || echo "FAIL: 发现纯黑 → $result"

# 验证 body color
grep "color: #1d1d1f" public/static/style.css && echo "PASS: body color 正确" || echo "FAIL"
```

---

### TC-02: 视觉-品牌色 & Navbar/Footer [手测] P0

```
Given   服务启动在 http://localhost:3000
When    打开浏览器访问首页
Then    Navbar 高度 = 56px，position = fixed，背景半透明 + 毛玻璃
        Footer 背景为深色渐变 (非纯黑 #000)，存在 aurora 呼吸动效
        所有按钮 hover 时出现品牌色 (#5DC4B3) 反馈
        focus-visible 时出现 2px #5DC4B3 outline
```

**自动化验证 (Playwright):**
```typescript
test('Navbar glassmorphism', async ({ page }) => {
  await page.goto('http://localhost:3000');
  const navbar = page.locator('.sc-navbar');
  const style = await navbar.evaluate(el => getComputedStyle(el));
  expect(style.position).toBe('fixed');
  expect(style.height).toBe('56px');
  expect(style.backdropFilter).toContain('blur');
});
```

---

### TC-03: i18n-英文全页面覆盖 [自动] P0

```
Given   服务运行中
When    依次访问以下 URL (均带 ?lang=en):
          /login?lang=en
          /?lang=en
          /uac?lang=en
          /allocation?lang=en
          /allocation/AB-20260305-001?lang=en
          /reconciliation?lang=en
          /audit?lang=en
Then    每个页面的 HTML body 内不包含以下中文关键词:
          "仪表盘", "管理", "列表", "详情", "对账", "审计", "登录", "状态", "操作"
        (排除 meta 和 script 标签内的内容)
```

**自动化脚本:**
```bash
pages=("/" "/uac" "/allocation" "/allocation/AB-20260305-001" "/reconciliation" "/audit")
chinese_leak=0

for p in "${pages[@]}"; do
  body=$(curl -s -b "sc_session=...; sc_token=..." "http://localhost:3000${p}?lang=en")
  # 提取 body 标签内文本 (排除 script)
  if echo "$body" | sed 's/<script[^>]*>.*<\/script>//g' | grep -P '[\x{4e00}-\x{9fff}]' > /dev/null 2>&1; then
    echo "FAIL: 中文泄漏 @ ${p}?lang=en"
    chinese_leak=1
  else
    echo "PASS: ${p}?lang=en"
  fi
done

[ $chinese_leak -eq 0 ] && echo "ALL PASS" || echo "SOME FAILED"
```

---

### TC-04: i18n-金额格式正确性 [自动] P1

```
Given   金额值 12,580,000 (CNY)
When    分别用 lang=zh 和 lang=en 格式化
Then    zh: "¥1258万"
        en: "¥12.58M"

Given   金额值 358,600,000 (CNY)
When    分别用 lang=zh 和 lang=en 格式化
Then    zh: "¥3.59亿"
        en: "¥358.60M"

Given   金额值 500,000 (CNY)
When    分别用 lang=zh 和 lang=en 格式化
Then    zh: "¥50万"
        en: "¥500K"
```

**可嵌入单元测试:**
```typescript
import { fmtAmount } from './src/lib/i18n';

// TC-04a
assert(fmtAmount(12_580_000, 'zh') === '¥1258万');
assert(fmtAmount(12_580_000, 'en') === '¥12.58M');

// TC-04b
assert(fmtAmount(358_600_000, 'zh') === '¥3.59亿');
assert(fmtAmount(358_600_000, 'en') === '¥358.60M');

// TC-04c
assert(fmtAmount(500_000, 'zh') === '¥50万');
assert(fmtAmount(500_000, 'en') === '¥500K');
```

---

### TC-05: i18n-时间 HKT 转换 [自动] P1

```
Given   ISO 时间 "2026-03-05T06:00:00Z" (UTC)
When    用 fmtDate() 转换
Then    zh: "2026年03月05日 14:00 HKT"
        en: "2026-03-05 14:00 HKT"
        (UTC 06:00 + 8h = HKT 14:00)
```

---

### TC-06: 领域-UAC 编号规则 [自动] P0

```
Given   系统中存在 uacList 数据
When    对所有 UAC.id 执行正则校验 /^UAC-\d{4}-\d{4}$/
Then    全部匹配通过
        且编号无重复 (Set.size === Array.length)
```

**自动化脚本:**
```bash
curl -s http://localhost:3000/ -b "..." | \
  grep -oP 'UAC-\d{4}-\d{4}' | sort | uniq -d | \
  (read line && echo "FAIL: 重复 UAC ID: $line" || echo "PASS: 无重复")
```

---

### TC-07: 领域-分账明细可追溯字段完整性 [自动] P0

```
Given   分配批次 AB-20260305-001 存在明细 items
When    检查每条 AllocItem 的字段
Then    每条明细应包含以下字段 (当前部分缺失):
          - id         ✓ 已有 (e.g. "AI-001-01")
          - target     ✓ 已有 (接收方)
          - amount     ✓ 已有
          - status     ✓ 已有
          - remark     ✓ 已有
          - uac_id     ✗ 缺失 → 需从父级 batch 继承或冗余存储
          - tpc_id     ✗ 缺失 → 需新增
          - ia_id      ✗ 缺失 → 需新增
          - batch_id   ✗ 缺失 → 需从父级 batch 继承或冗余存储
          - source_txn_id  ✗ 缺失 → 需新增 (源交易流水号)

STATUS: 5/10 字段合格 → 阻断性缺陷，需补全
```

---

### TC-08: 幂等-同日同UAC重复计算 [手测→自动] P0

```
Given   UAC-2026-0001 在 2026-03-05 已有批次 AB-20260305-001
When    再次发起 POST /api/allocation/calculate {uac_id:"UAC-2026-0001", date:"2026-03-05"}
Then    响应 HTTP 409 Conflict
        Body: { error: "duplicate_allocation", existing_batch_id: "AB-20260305-001" }
        且 allocation_items 表无新增记录

STATUS: 待实现 (当前无写入 API，优先级 P0)
```

---

### TC-09: 异常-TPC无持有人映射进异常队列 [手测→自动] P0

```
Given   TPC-2026-0015 存在但 beneficiary_map 为空
        UAC-2026-0004 关联了 TPC-2026-0015
When    对 UAC-2026-0004 执行分账计算
Then    TPC-2026-0015 对应的分配明细:
          - status = "exception"
          - exception_reason = "no_beneficiary_mapping"
        该明细不执行银行指令
        异常队列 /api/exceptions 中可查到该条记录
        audit_logs 记录一条 action="allocation_exception" 的日志

STATUS: 待实现 (需 TPC 数据模型 + 异常队列)
```

---

### TC-10: 异常-批次 partial_failed [自动] P1

```
Given   批次 AB-20260304-012 包含 3 条明细:
          AI-012-01: failed  (¥5,000,000)
          AI-012-02: pending (¥2,000,000)
          AI-012-03: completed (¥1,500,000)
When    计算批次最终状态
Then    batch.status 应为 "partial_failed" (非 "failed")
        batch.progress 应反映实际完成比例 = 1/3 ≈ 33%

当前现状: batch status 仅有 pending/completed/failed
         AB-20260304-012 标记为 "failed" → 语义不够精确
需增加:  "partial_failed" 状态
```

---

### TC-11: 银行指令-CSV导出内容一致 [手测→自动] P1

```
Given   页面上展示批次 AB-20260305-001 的 4 条分配明细
When    点击 "导出" → 确认 → 下载 CSV
Then    CSV 文件:
          - 第1行为表头: batch_id,item_id,recipient,amount_cny,status,remark,uac_id,tpc_id,ia_id,source_txn_id
          - 包含 4 行数据
          - amount_cny 列为原始数值 (800000, 600000, 500000, 500000)，非格式化字符串
          - 总额 sum(amount_cny) = 2,400,000 = 页面显示的批次总额

STATUS: 待实现 (当前 Export 仅弹窗确认 UI)
```

---

### TC-12: 银行指令-回执导入后状态更新 [手测→自动] P1

```
Given   批次 AB-20260305-001 中 AI-001-03 和 AI-001-04 状态为 pending
When    上传银行回执 CSV:
          AI-001-03,completed,2026-03-05T10:30:00Z,BANK-REF-9876
          AI-001-04,failed,2026-03-05T10:35:00Z,,insufficient_funds
Then    AI-001-03.status 变为 completed
        AI-001-04.status 变为 failed
        batch AB-20260305-001:
          - progress 更新为 75% (3/4 completed)
          - status 更新为 partial_failed (因含 failed)
        audit_logs 新增 action="receipt_imported" 日志

STATUS: 待实现
```

---

### TC-13: 对账-应付vs已付差异生成差错单 [手测→自动] P1

```
Given   对账批次 RC-20260305-001 中:
          RI-001-03: sysAmount=500,000  bankAmount=480,000  diff=20,000  status=unmatched
          RI-001-05: sysAmount=1,600,000 bankAmount=0       diff=1,600,000 status=exception
When    对 RI-001-03 发起 "生成差错单"
Then    创建差错单 DR-20260305-001:
          - recon_batch_id = RC-20260305-001
          - recon_item_id = RI-001-03
          - dispute_type = "amount_mismatch"
          - expected_amount = 500,000
          - actual_amount = 480,000
          - difference = 20,000
          - status = "open"
        audit_logs 记录 action="dispute_created"

STATUS: 待实现 (当前对账 Modal 仅展示数据，无差错单操作)
```

---

### TC-14: 审计-所有写操作记录 [自动] P0

```
Given   审计日志为空 (新启动服务)
When    依次执行以下操作:
          1. POST /login (standalone 登录 admin)
          2. GET / (页面访问)
          3. GET /uac (页面访问)
          4. GET /allocation (页面访问)
          5. GET /logout (登出)
Then    GET /audit 返回至少 5 条日志:
          - action 包含: standalone_login, page_view(×3), logout
          - 每条日志含: id, timestamp, user_sub, user_role, path, mode
          - 所有 mode 为 "standalone"
          - 无任何字段包含完整 JWT token
```

**自动化脚本 (curl):**
```bash
# 1. 登录获取 cookie
resp=$(curl -s -D - -X POST http://localhost:3000/login \
  -d "username=admin&password=admin123" \
  -L -c cookies.txt)

# 2-4. 访问页面
curl -s -b cookies.txt http://localhost:3000/ > /dev/null
curl -s -b cookies.txt http://localhost:3000/uac > /dev/null
curl -s -b cookies.txt http://localhost:3000/allocation > /dev/null

# 5. 登出
curl -s -b cookies.txt http://localhost:3000/logout -L > /dev/null

# 重新登录检查审计
curl -s -D - -X POST http://localhost:3000/login \
  -d "username=admin&password=admin123" -L -c cookies.txt > /dev/null
audit_page=$(curl -s -b cookies.txt http://localhost:3000/audit)

echo "$audit_page" | grep -c "standalone_login" | \
  xargs -I{} test {} -ge 1 && echo "PASS: login logged" || echo "FAIL"
echo "$audit_page" | grep -c "page_view" | \
  xargs -I{} test {} -ge 3 && echo "PASS: page_view logged" || echo "FAIL"
echo "$audit_page" | grep -c "logout" | \
  xargs -I{} test {} -ge 1 && echo "PASS: logout logged" || echo "FAIL"
```

---

### TC-15: 审计-Chain模式完整链路 [自动] P0

```
Given   服务运行中
When    1. 获取 Chain 测试 token: GET /api/chain-token?name=ExternalUser&role=operator
        2. 使用返回的 chain_url 访问系统 (自动重定向握手)
        3. 访问 /uac?lang=en
        4. 访问 /allocation?lang=en
        5. 访问 /audit?lang=en
Then    审计日志中:
          - 存在 action="chain_entry" 的记录
            - chain_context.source_app 非空
            - chain_context.token_fp 为 8 字符 (SHA-256 fingerprint)
          - 后续 page_view 的 mode 均为 "chain"
          - 无任何日志字段包含完整 JWT
```

---

### TC-16: 审计-按UAC/TPC/IA查询完整链路 [手测] P1

```
Given   UAC-2026-0001 经历: 创建 → 分配 AB-20260305-001 → 对账 → 差错单
When    调用 GET /api/audit?uac_id=UAC-2026-0001
Then    返回该 UAC 全生命周期的有序日志列表
        包含: uac_created, allocation_started, allocation_completed,
              recon_matched, dispute_created (如有)
        每条日志可关联到 batch_id / recon_batch_id

STATUS: 待实现 (需扩展 audit_logs 的查询维度)
```

---

### TC-17: 认证-Standalone 登录完整流程 [自动] P0

```
Given   服务运行中，未登录状态
When    1. GET / → 应重定向到 /login
        2. POST /login { username: "admin", password: "admin123" } → 应重定向到 /
        3. 检查响应 Set-Cookie 头
Then    步骤1: HTTP 302 → Location: /login
        步骤2: HTTP 302 → Location: /
        步骤3: 设置了 sc_session 和 sc_token 两个 cookie
                - 均包含 HttpOnly
                - 均包含 SameSite=Lax
                - Max-Age=86400

Given   错误密码
When    POST /login { username: "admin", password: "wrong" }
Then    返回 200 (重新渲染登录页)
        HTML 包含错误提示文案
```

---

### TC-18: 对账-匹配率边界验证 [自动] P1

```
Given   对账批次 RC-20260304-001:
          totalAmount = 51,200,000
          matchedAmount = 51,200,000
          unmatchedAmount = 0
When    计算 matchRate
Then    matchRate = 100.0
        status = "matched"

Given   一个假设批次: totalAmount = 100, matchedAmount = 0
When    计算 matchRate
Then    matchRate = 0
        status = "unmatched"
```

---

## 三、缺失项汇总 (Gap Analysis)

| 优先级 | 缺失项 | 影响范围 | 建议 |
|--------|--------|----------|------|
| **P0** | TPC (Third Party Counterpart) 数据模型 | C-2, E-1, TC-09, TC-16 | 新增 `TPC` interface，编号格式 `TPC-YYYY-NNNN` |
| **P0** | IA (Investment Agreement) 数据模型 | C-3, TC-07, TC-16 | 新增 `IA` interface，编号格式 `IA-YYYYMMDD-NNN` |
| **P0** | 分账明细缺少追溯字段 | C-5, TC-07, TC-11 | `AllocItem` 增加 `uac_id, tpc_id, ia_id, batch_id, source_txn_id` |
| **P0** | 幂等控制 (API 层) | D-1, D-2, D-3, TC-08 | 实现 `Idempotency-Key` 中间件 + 去重逻辑 |
| **P1** | `partial_failed` 批次状态 | E-2, TC-10, TC-12 | `AllocBatch.status` 增加 `partial_failed` 枚举 |
| **P1** | CSV/JSON 实际导出逻辑 | F-1~F-3, TC-11 | 实现 `GET /api/allocation/:id/export?format=csv|json` |
| **P1** | 银行回执导入 | F-4, F-5, TC-12 | 实现 `POST /api/allocation/:id/receipt` |
| **P1** | 差错单生成 | G-2, TC-13 | 新增 `Dispute` 数据模型 + API |
| **P1** | 异常队列 | E-1, TC-09 | 新增 `/api/exceptions` 端点 + UI |
| **P2** | 审计按 UAC/TPC/IA 维度查询 | H-3~H-5, TC-16 | audit_logs 增加 `entity_type + entity_id` 字段 |
| **P2** | 审计日志不可篡改 (D1) | H-7 | 迁移至 D1 后设置 append-only 权限 |
| **P2** | 自定义 404 页面 | E-5 | 实现 `app.notFound()` handler |

---

## 四、测试执行建议

### 手动冒烟测试 (Smoke Test) - 5分钟

1. 打开 `/login` → 用 admin/admin123 登录 → 确认进入仪表盘
2. 切换 `?lang=en` → 检查无中文泄漏
3. 访问 `/uac` → 点击任一 UAC → Drawer 弹出
4. 访问 `/allocation` → 点击进入详情页 → 检查面包屑
5. 访问 `/reconciliation` → 点击详情 → 查看匹配率
6. 访问 `/audit` → 确认有日志记录
7. 点击退出 → 确认回到登录页

### 自动化回归 (CI 级)

```bash
#!/bin/bash
# 快速回归脚本 (需先启动服务)
echo "=== 履约通 QA Regression ==="

# 1. 无纯黑
echo "[TC-01] 禁纯黑..."
! grep -rn "#000000\|rgb(0,0,0)" src/ public/ --include="*.css" --include="*.tsx" && echo "PASS" || echo "FAIL"

# 2. 健康检查
echo "[Health] API..."
curl -sf http://localhost:3000/api/health | grep -q '"ok"' && echo "PASS" || echo "FAIL"

# 3. 登录流程
echo "[TC-17] 登录..."
status=$(curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:3000/login -d "username=admin&password=admin123" -D -)
[ "$status" = "302" ] && echo "PASS" || echo "FAIL: $status"

# 4. Chain token API
echo "[Chain] Token生成..."
curl -sf http://localhost:3000/api/chain-token | grep -q 'chain_url' && echo "PASS" || echo "FAIL"

echo "=== Done ==="
```

---

> **结语**: 当前【履约通】在视觉一致性、i18n、认证安全、审计基础方面完成度较高 (~70%)。
> 核心缺失集中在: **TPC/IA 数据模型、分账可追溯字段、幂等控制、银行指令导出/导入、差错单**。
> 建议下一迭代优先补齐 P0 项 (领域模型 + 幂等)，再推进 P1 (导出/回执/差错单)。
