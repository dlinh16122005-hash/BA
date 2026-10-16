import { useEffect, useRef, useState } from "react"
import {
  ActionBar,
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Field,
  Icon,
  PageHeading,
  SearchField,
  Section,
  SelectField,
  StatCard,
} from "./ui"
import { money } from "./model"

export type Debt = {
  id: string
  customer: string
  name: string
  date: string
  due: string
  amount: number
  paid: number
  group: string
  idle: number
  clock?: string
}
type Rule = {
  id: string
  name: string
  kind: string
  days: string
  minimum: string
  idle: string
  severity: string
  template: string
  channel: string
  time: string
  frequency: string
  active: string
}
type Queue = {
  id: string
  customer: string
  rule: Rule
  status: string
  error?: string
}
type History = {
  id: string
  time: string
  customer: string
  action: string
  amount: number
  detail: string
  report?: Debt[]
}
const variables = [
  "{Ten_KH}",
  "{So_Tien_No}",
  "{So_Ngay_Qua_Han}",
  "{Link_Thanh_Toan}",
]
const template =
  "Kính gửi {Ten_KH}, khoản nợ {So_Tien_No} đã quá hạn {So_Ngay_Qua_Han} ngày. Vui lòng liên hệ HTX Hoa Lợi để thanh toán."
const seed: Debt[] = [
  {
    id: "HD-101",
    customer: "KH-001",
    name: "Đại lý Hoa Mai",
    date: "2026-10-01",
    due: "2026-10-03",
    amount: 10000000,
    paid: 3000000,
    group: "Đại lý",
    idle: 20,
  },
  {
    id: "HD-102",
    customer: "KH-002",
    name: "Đại lý Minh Tâm",
    date: "2026-10-02",
    due: "2026-10-05",
    amount: 15000000,
    paid: 2500000,
    group: "Đại lý",
    idle: 18,
  },
  {
    id: "HD-103",
    customer: "KH-001",
    name: "Đại lý Hoa Mai",
    date: "2026-10-04",
    due: "2026-10-16",
    amount: 5000000,
    paid: 1000000,
    group: "Đại lý",
    idle: 20,
  },
  {
    id: "HD-104",
    customer: "KH-003",
    name: "Cửa hàng An Phú",
    date: "2026-10-06",
    due: "2026-10-13",
    amount: 8000000,
    paid: 2000000,
    group: "Khách sỉ",
    idle: 10,
  },
  {
    id: "HD-105",
    customer: "KH-004",
    name: "Cửa hàng Bình Minh",
    date: "2026-10-08",
    due: "2026-10-25",
    amount: 6000000,
    paid: 0,
    group: "Khách sỉ",
    idle: 5,
  },
  {
    id: "HD-106",
    customer: "KH-005",
    name: "Đại lý Thành Công",
    date: "2026-10-09",
    due: "",
    amount: 4000000,
    paid: 500000,
    group: "Đại lý",
    idle: 15,
  },
]
const rulesSeed: Rule[] = [
  {
    id: "KB-001",
    name: "Cảnh báo quá hạn từ 7 ngày",
    kind: "Đã quá hạn",
    days: "7",
    minimum: "1000000",
    idle: "0",
    severity: "Nghiêm trọng",
    template,
    channel: "Zalo",
    time: "09:00",
    frequency: "Hàng ngày",
    active: "true",
  },
  {
    id: "KB-002",
    name: "Nhắc thanh toán trước hạn 3 ngày",
    kind: "Trước khi đến hạn",
    days: "3",
    minimum: "1000000",
    idle: "0",
    severity: "Nhắc nhở",
    template:
      "Kính gửi {Ten_KH}, khoản nợ {So_Tien_No} sắp đến hạn. Vui lòng chuẩn bị thanh toán. Cảm ơn quý khách!",
    channel: "SMS",
    time: "08:30",
    frequency: "Hàng ngày",
    active: "true",
  },
]
const blankRule: Rule = {
  id: "",
  name: "",
  kind: "",
  days: "",
  minimum: "",
  idle: "",
  severity: "",
  template: "",
  channel: "",
  time: "",
  frequency: "",
  active: "",
}
function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback
  } catch {
    return fallback
  }
}
const balance = (d: Debt) => Math.max(0, d.amount - d.paid)
const overdue = (d: Debt) =>
  d.due
    ? Math.round((Date.parse(d.clock || "2026-10-13") - Date.parse(d.due)) / 86400000)
    : null
const status = (d: Debt) => {
  const n = overdue(d)
  return n === null
    ? "Chưa xác định hạn"
    : n > 0
      ? "Quá hạn"
      : n === 0
        ? "Đến hạn"
        : n >= -3
          ? "Sắp đến hạn"
          : "Chưa đến hạn"
}
function message(r: Rule, ds: Debt[]) {
  const vals = [
    ds[0]?.name || "Đại lý Hoa Mai",
    `${money(ds.reduce((s, d) => s + balance(d), 0))} VNĐ`,
    String(Math.max(0, ...ds.map((d) => overdue(d) ?? 0))),
    "[Liên kết thanh toán demo]",
  ]
  return variables.reduce((s, v, i) => s.split(v).join(vals[i]), r.template)
}
function initialQueue(): Queue[] {
  return [
    {
      id: "N-001",
      customer: "KH-001",
      rule: rulesSeed[0],
      status: "Chờ duyệt",
    },
    {
      id: "N-002",
      customer: "KH-002",
      rule: rulesSeed[0],
      status: "Chờ duyệt",
    },
    {
      id: "N-003",
      customer: "KH-001",
      rule: rulesSeed[1],
      status: "Chờ duyệt",
    },
  ]
}

type Props = {
  onExit: () => void
  sharedDebts?: Debt[]
  getLatestDebts?: () => Debt[]
  demoDate?: string
}
function queueForActualDebts(ds: Debt[]): Queue[] {
  return rulesSeed.flatMap((rule) => {
    const clients = [...new Set(ds.filter((d) =>
      balance(d) >= Number(rule.minimum) && overdue(d) !== null &&
      (rule.kind === "Đã quá hạn"
        ? overdue(d)! >= Number(rule.days)
        : overdue(d)! <= 0 && overdue(d)! >= -Number(rule.days))
    ).map((d) => d.customer))]
    return clients.map((customer) => ({
      id: `DEMO-${rule.id}-${customer}`, customer, rule, status: "Chờ duyệt",
    }))
  })
}
export default function DebtNotifications({ onExit, sharedDebts, getLatestDebts, demoDate = "2026-10-13" }: Props) {
  const [tab, setTab] = useState("create")
  const [debts, setDebts] = useState<Debt[]>(() => sharedDebts ?? load("hoaloi-cn04-debts", seed))
  const [rules, setRules] = useState<Rule[]>(() => load("hoaloi-cn04-rules", rulesSeed))
  const [queue, setQueue] = useState<Queue[]>(() => {
    const original = load<Queue[]>("hoaloi-cn04-queue", sharedDebts ? queueForActualDebts(sharedDebts) : initialQueue())
    return sharedDebts ? original.filter((q) => sharedDebts.some((d) => d.customer === q.customer)) : original
  })
  const [history, setHistory] = useState<History[]>(() =>
    load("hoaloi-cn04-history", []),
  )
  const [selected, setSelected] = useState<string[]>([])
  const [preview, setPreview] = useState<Debt[] | null>(null)
  const [edit, setEdit] = useState<Rule | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [query, setQuery] = useState("")
  const [group, setGroup] = useState("all")
  const [condition, setCondition] = useState("all")
  const [from, setFrom] = useState(() => sharedDebts?.length ? sharedDebts.map((d) => d.date).sort()[0] : "2026-10-01")
  const [to, setTo] = useState(() => sharedDebts ? demoDate : "2026-10-31")
  const [channel, setChannel] = useState("all")
  const [ruleFilter, setRuleFilter] = useState("all")
  const [severity, setSeverity] = useState("all")
  const [detail, setDetail] = useState<Queue | null>(null)
  const [notice, setNotice] = useState<{
    tone: "success" | "error" | "warning" | "info"
    text: string
  } | null>(null)
  const [dialog, setDialog] = useState<{
    title: string
    text: string
    action: () => void
  } | null>(null)
  const [cancel, setCancel] = useState<Queue | null>(null)
  const [reason, setReason] = useState("")
  const [demo, setDemo] = useState("normal")
  const templateRef = useRef<HTMLTextAreaElement>(null)
  useEffect(() => {
    if (!sharedDebts) return
    setDebts(sharedDebts)
    setSelected([])
    setPreview((prev) => {
      if (!prev) return null
      const changed = prev.some((row) => {
        const latest = sharedDebts.find((d) => d.id === row.id)
        return !latest || balance(latest) !== balance(row) || latest.due !== row.due
      })
      return changed ? null : prev
    })
    setQueue((before) => before.filter((q) => sharedDebts.some((d) =>
      d.customer === q.customer && balance(d) > 0)))
  }, [sharedDebts])
  function save<T>(key: string, value: T, setter: (v: T) => void) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      setter(value)
      return true
    } catch {
      setNotice({
        tone: "error",
        text: "Không thể lưu vào trình duyệt. Dữ liệu vừa nhập được giữ lại để thử lại.",
      })
      return false
    }
  }
  function log(action: string, ds: Debt[], detailText = "") {
    const row: History = {
      id: crypto.randomUUID(),
      time: new Date().toLocaleString("vi-VN"),
      customer: [...new Set(ds.map((d) => d.name))].join(", "),
      action,
      amount: ds.reduce((s, d) => s + balance(d), 0),
      detail: detailText,
      report: structuredClone(ds),
    }
    return save("hoaloi-cn04-history", [row, ...history], setHistory)
  }
  function switchTab(next: string) {
    setTab(next)
    setSelected([])
    setPreview(null)
    setEdit(null)
    setDetail(null)
    setNotice(null)
  }
  function toggle(id: string) {
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    )
  }
  const visible = debts.filter(
    (d) =>
      balance(d) > 0 &&
      `${d.name} ${d.customer}`.toLowerCase().includes(query.toLowerCase()) &&
      (group === "all" || d.group === group) &&
      (condition === "all" || status(d) === condition) &&
      d.date >= from &&
      d.date <= to,
  )
  const queued = queue.filter(
    (q) =>
      (channel === "all" || q.rule.channel === channel) &&
      (ruleFilter === "all" || q.rule.id === ruleFilter) &&
      (severity === "all" || q.rule.severity === severity),
  )
  const selectedDebts = debts.filter((d) => selected.includes(d.id))
  const queueDebts = (q: Queue) =>
    debts.filter(
      (d) =>
        d.customer === q.customer &&
        balance(d) > 0 &&
        overdue(d) !== null &&
        (q.rule.kind === "Đã quá hạn"
          ? overdue(d)! >= Number(q.rule.days)
          : overdue(d)! <= 0 && overdue(d)! >= -Number(q.rule.days)),
    )
  function currentValid(ds: Debt[]) {
    const latest = getLatestDebts ? getLatestDebts() : load<Debt[]>("hoaloi-cn04-debts", debts)
    if (
      ds.some((d) => {
        const n = latest.find((x) => x.id === d.id)
        return !n || balance(n) !== balance(d) || n.due !== d.due
      })
    ) {
      setDebts(latest)
      save(
        "hoaloi-cn04-queue",
        queue.filter((q) =>
          latest.some((d) => d.customer === q.customer && balance(d) > 0),
        ),
        setQueue,
      )
      setPreview(null)
      setSelected([])
      setNotice({
        tone: "warning",
        text: "Công nợ vừa thay đổi. Đã tải số liệu mới nhất và loại khách hàng đã tất toán; vui lòng chọn và xác nhận lại.",
      })
      return false
    }
    return true
  }
  function saveRule() {
    if (!edit) return
    const e: Record<string, string> = {}
    if (!edit.name.trim()) e.name = "Vui lòng nhập tên kịch bản."
    else if (
      rules.some(
        (r) =>
          r.id !== edit.id &&
          r.name.trim().toLocaleLowerCase() ===
            edit.name.trim().toLocaleLowerCase(),
      )
    )
      e.name = "Tên kịch bản đã tồn tại."
    for (const key of ["days", "minimum", "idle"] as const)
      if (
        !/^\d+$/.test(edit[key]) ||
        (key === "minimum" && Number(edit[key]) <= 0)
      )
        e[key] =
          key === "minimum"
            ? "Nhập số nguyên dương lớn hơn 0."
            : "Nhập số nguyên không âm."
    for (const key of [
      "kind",
      "severity",
      "channel",
      "time",
      "frequency",
      "active",
    ] as const)
      if (!edit[key]) e[key] = "Vui lòng chọn giá trị."
    const stripped = variables.reduce(
      (s, v) => s.split(v).join(""),
      edit.template,
    )
    if (!edit.template.trim() || /[{}]/.test(stripped))
      e.template = "Nội dung bắt buộc và chỉ được dùng 4 biến chuẩn."
    setErrors(e)
    if (Object.keys(e).length) return
    const r = {
      ...edit,
      name: edit.name.trim(),
      id: edit.id || crypto.randomUUID(),
    }
    if (
      save(
        "hoaloi-cn04-rules",
        edit.id ? rules.map((x) => (x.id === r.id ? r : x)) : [...rules, r],
        setRules,
      )
    ) {
      setEdit(null)
      setNotice({
        tone: "success",
        text: "Đã lưu kịch bản. Cấu hình lịch quét được lưu trong demo; chưa có tiến trình chạy ngầm thật.",
      })
    }
  }
  function send() {
    const items = queue.filter((q) => selected.includes(q.id))
    const ds = items.flatMap(queueDebts)
    if (!currentValid(ds)) {
      setDialog(null)
      return
    }
    const rows: History[] = []
    let successes = 0
    let failures = 0
    const next = queue.flatMap((q) => {
      if (!selected.includes(q.id)) return [q]
      const qd = queueDebts(q)
      if (!qd.length) return []
      const fail = demo === "failure" && q.customer === "KH-002"
      fail ? failures++ : successes++
      rows.push({
        id: crypto.randomUUID(),
        time: new Date().toLocaleString("vi-VN"),
        customer: qd[0].name,
        action: fail ? "Gửi lỗi (demo)" : "Đã gửi (demo)",
        amount: qd.reduce((s, d) => s + balance(d), 0),
        detail: fail
          ? "Lỗi kết nối cổng gửi tin"
          : `${q.rule.name} · ${q.rule.channel} · ${message(q.rule, qd)}`,
      })
      return fail
        ? [
            {
              ...q,
              status: "Gửi lỗi",
              error: "Lỗi kết nối cổng gửi tin (demo)",
            },
          ]
        : []
    })
    save("hoaloi-cn04-queue", next, setQueue)
    save("hoaloi-cn04-history", [...rows, ...history], setHistory)
    setSelected([])
    setDialog(null)
    setDetail(null)
    setNotice({
      tone: failures ? "warning" : "success",
      text: `Kết quả mô phỏng: ${successes} thông báo thành công, ${failures} thông báo gửi lỗi. Không gửi tin thật.`,
    })
  }
  function confirmSend() {
    const items = queue.filter((q) => selected.includes(q.id))
    setDialog({
      title: "Xác nhận duyệt và gửi",
      text: `Sẽ mô phỏng gửi ${items.length} thông báo: ${["Zalo", "SMS"].map((c) => `${items.filter((q) => q.rule.channel === c).length} qua ${c}`).join(", ")}. Vui lòng kiểm tra nội dung và số dư trước khi xác nhận.`,
      action: send,
    })
  }
  function output(kind: string) {
    if (!preview || !currentValid(preview)) return
    if (kind === "In / PDF") {
      window.print()
      setNotice({
        tone: "info",
        text: "Đã mở giao diện in. Chọn Lưu dưới dạng PDF để xuất PDF; chưa xác nhận phát hành thành công.",
      })
      return
    }
    if (kind === "Excel") {
      try {
        exportExcel(preview, demoDate)
        log("Xuất Excel", preview)
        setNotice({
          tone: "success",
          text: "Đã xuất thông báo dạng Excel XML (.xml), có thể mở bằng Microsoft Excel.",
        })
      } catch {
        setNotice({
          tone: "error",
          text: "Không thể xuất file. Vui lòng thử lại.",
        })
      }
      return
    }
    if (kind === "Zalo" || kind === "Email") {
      log(`Mô phỏng gửi ${kind}`, preview)
      setNotice({
        tone: "info",
        text: `Đã ghi nhận mô phỏng gửi ${kind}. Chưa kết nối dịch vụ gửi thật.`,
      })
      return
    }
    if (!log("Lưu báo cáo", preview)) return
    setNotice({
      tone: "success",
      text: "Đã lưu báo cáo vào lịch sử trong trình duyệt.",
    })
  }
  return (
    <div className="notifications">
      <PageHeading
        title="Thông báo công nợ"
        description="Lập thông báo, thiết lập quy tắc và chủ động nhắc khách hàng thanh toán"
        breadcrumb="Công nợ khách hàng / Thông báo công nợ"
      />
      <nav
        className="notification-tabs"
        aria-label="Chức năng thông báo công nợ"
      >
        {[
          ["create", "Lập thông báo", "file"],
          ["rules", "Kịch bản nhắc nợ", "clock"],
          ["queue", "Chờ duyệt gửi", "bell"],
          ["history", "Lịch sử", "chart"],
        ].map(([id, label, icon]) => (
          <Button
            key={id}
            variant="link"
            className={tab === id ? "tab-current" : ""}
            aria-current={tab === id ? "page" : undefined}
            onClick={() => switchTab(id)}
          >
            <Icon name={icon} />
            {label}
            {id === "queue" && <span className="count">{queue.length}</span>}
          </Button>
        ))}
      </nav>
      {notice && <Alert tone={notice.tone} title={notice.text} />}
      {tab === "create" && !preview && (
        <>
          <div className="stats">
            <StatCard
              icon="users"
              label="Khách hàng còn công nợ"
              value={
                new Set(
                  debts.filter((d) => balance(d) > 0).map((d) => d.customer),
                ).size
              }
              unit="khách hàng"
            />
            <StatCard
              icon="chart"
              label="Tổng còn phải thu"
              value={money(debts.reduce((s, d) => s + balance(d), 0))}
              unit="VNĐ"
            />
            <StatCard
              icon="clock"
              label="Khoản nợ quá hạn"
              value={
                debts.filter((d) => (overdue(d) ?? 0) > 0 && balance(d) > 0)
                  .length
              }
              unit="khoản nợ"
            />
          </div>
          <Section title="Tra cứu khoản nợ" readonly={false}>
            <div className="notification-filters">
              <SearchField
                label="Mã / Tên khách hàng"
                placeholder="Tìm mã hoặc tên khách hàng"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSelected([])
                }}
              />
              <TextField
                label="Từ ngày"
                type="date"
                value={from}
                onChange={(v) => {
                  setFrom(v)
                  setSelected([])
                }}
              />
              <TextField
                label="Đến ngày"
                type="date"
                value={to}
                onChange={(v) => {
                  setTo(v)
                  setSelected([])
                }}
              />
              <SelectField
                label="Đầu mục tài khoản"
                value="131"
                onChange={() => {}}
              >
                <option value="131">131 – Phải thu khách hàng</option>
              </SelectField>
              <SelectField
                label="Nhóm khách hàng"
                value={group}
                onChange={(e) => {
                  setGroup(e.target.value)
                  setSelected([])
                }}
              >
                <option value="all">Tất cả nhóm</option>
                {[...new Set(debts.map((d) => d.group))].sort().map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </SelectField>
              <SelectField
                label="Tình trạng nợ"
                value={condition}
                onChange={(e) => {
                  setCondition(e.target.value)
                  setSelected([])
                }}
              >
                <option value="all">Tất cả tình trạng</option>
                {[
                  "Chưa đến hạn",
                  "Sắp đến hạn",
                  "Đến hạn",
                  "Quá hạn",
                  "Chưa xác định hạn",
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </SelectField>
            </div>
          </Section>
          <Section
            title={`Danh sách khoản nợ (${visible.length})`}
            readonly={false}
          >
            <DebtTable
              ds={visible}
              selected={selected}
              toggle={toggle}
              selectAll={() =>
                setSelected(
                  selected.length === visible.length
                    ? []
                    : visible.map((d) => d.id),
                )
              }
            />
            {!visible.length && (
              <EmptyState
                title="Không có khoản nợ phù hợp"
                description="Thay đổi tiêu chí lọc để tra cứu lại."
              >
                <Button
                  onClick={() => {
                    setQuery("")
                    setCondition("all")
                    setGroup("all")
                    setFrom(sharedDebts?.length ? sharedDebts.map((d) => d.date).sort()[0] : "2026-10-01")
                    setTo(sharedDebts ? demoDate : "2026-10-31")
                  }}
                >
                  Xóa điều kiện lọc
                </Button>
              </EmptyState>
            )}
          </Section>
          <Alert tone="info" title="Thông báo không làm thay đổi công nợ">
            Số còn phải thu đã trừ các khoản thanh toán / giảm trừ hợp lệ. Khoản
            thiếu hạn thanh toán không tự tính số ngày quá hạn.
          </Alert>
          <ActionBar
            hint={`Đã chọn ${selected.length} khoản nợ · ${money(selectedDebts.reduce((s, d) => s + balance(d), 0))} VNĐ`}
          >
            <Button onClick={onExit}>Thoát</Button>
            <Button
              variant="primary"
              disabled={!selected.length || !from || !to || from > to}
              onClick={() => {
                if (currentValid(selectedDebts)) {
                  setPreview(structuredClone(selectedDebts))
                  setNotice(null)
                }
              }}
            >
              Xem thông báo <Icon name="arrow" />
            </Button>
          </ActionBar>
        </>
      )}
      {tab === "create" && preview && (
        <>
          <div className="detail-toolbar">
            <Button variant="link" onClick={() => setPreview(null)}>
              <Icon name="back" />
              Thay đổi khoản nợ
            </Button>
            <Badge>Mẫu thông báo mặc định</Badge>
          </div>
          <div className="print-documents">
            {[...new Set(preview.map((d) => d.customer))].map((c) => {
              const ds = preview.filter((d) => d.customer === c)
              return (
                <Section key={c} title="THÔNG BÁO CÔNG NỢ">
                  <div className="document-brand">
                    HỢP TÁC XÃ HOA LỢI
                    <span>
                      Ngày lập: {demoDate.split("-").reverse().join("/")} · Kỳ: {from} – {to}
                    </span>
                  </div>
                  <dl className="fields">
                    <Field label="Kính gửi">{ds[0].name}</Field>
                    <Field label="Mã khách hàng">{c}</Field>
                  </dl>
                  <p className="section-note">
                    HTX Hoa Lợi trân trọng thông báo các khoản công nợ còn phải
                    thanh toán như sau:
                  </p>
                  <DebtTable ds={ds} />
                  <div className="receivable-total">
                    <span>Tổng số tiền còn phải trả</span>
                    <strong>
                      {money(ds.reduce((s, d) => s + balance(d), 0))} VNĐ
                    </strong>
                  </div>
                  <p className="section-note">
                    Quý khách vui lòng đối chiếu và thanh toán theo hạn của từng
                    khoản nợ. Nếu đã thanh toán, vui lòng liên hệ kế toán để đối
                    soát. Trân trọng cảm ơn!
                  </p>
                  <div className="document-signature">
                    Người lập thông báo<strong>Kế toán · HTX Hoa Lợi</strong>
                  </div>
                </Section>
              )
            })}
          </div>
          <ActionBar hint="Kiểm tra số liệu trước khi phát hành">
            <Button onClick={() => setPreview(null)}>Quay lại</Button>
            <Button onClick={() => output("In / PDF")}>In / Lưu PDF</Button>
            <Button onClick={() => output("Excel")}>Xuất Excel</Button>
            <Button onClick={() => output("Zalo")}>Gửi Zalo (demo)</Button>
            <Button onClick={() => output("Email")}>Gửi Email (demo)</Button>
            <Button variant="primary" onClick={() => output("Lưu")}>
              Lưu báo cáo
            </Button>
          </ActionBar>
        </>
      )}
      {tab === "rules" && !edit && (
        <Section title="Kịch bản nhắc nợ tự động" readonly={false}>
          <div className="detail-toolbar">
            <span className="section-note">
              Kích hoạt lịch quét theo điều kiện đã thiết lập
            </span>
            <Button
              variant="primary"
              onClick={() => {
                setEdit({ ...blankRule })
                setErrors({})
                setNotice(null)
              }}
            >
              + Tạo mới kịch bản
            </Button>
          </div>
          <DataTable label="Danh sách kịch bản">
            <thead>
              <tr>
                <th>Tên kịch bản</th>
                <th>Điều kiện áp dụng</th>
                <th>Kênh / Lịch quét</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <span className="cell-sub">{r.severity}</span>
                  </td>
                  <td>
                    {r.kind} {r.days} ngày
                    <span className="cell-sub">
                      Nợ ≥ {money(Number(r.minimum))} VNĐ · Không mua mới:{" "}
                      {r.idle} ngày
                    </span>
                  </td>
                  <td>
                    {r.channel}
                    <span className="cell-sub">
                      {r.time} · {r.frequency}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="link"
                      role="switch"
                      aria-checked={r.active === "true"}
                      onClick={() =>
                        setDialog({
                          title:
                            r.active === "true"
                              ? "Ngừng kích hoạt kịch bản?"
                              : "Kích hoạt kịch bản?",
                          text: "Thay đổi chỉ áp dụng cho lần quét tiếp theo, không thay đổi lịch sử đã gửi.",
                          action: () => {
                            save(
                              "hoaloi-cn04-rules",
                              rules.map((x) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      active:
                                        x.active === "true" ? "false" : "true",
                                    }
                                  : x,
                              ),
                              setRules,
                            )
                            setDialog(null)
                          },
                        })
                      }
                    >
                      <Badge tone={r.active === "true" ? "success" : "info"}>
                        {r.active === "true"
                          ? "Đang kích hoạt"
                          : "Ngừng kích hoạt"}
                      </Badge>
                    </Button>
                  </td>
                  <td>
                    <div className="actions">
                      <Button
                        variant="link"
                        onClick={() => {
                          setEdit({ ...r })
                          setErrors({})
                        }}
                      >
                        Sửa
                      </Button>
                      <Button
                        variant="link"
                        onClick={() =>
                          setDialog({
                            title: "Xóa kịch bản?",
                            text: queue.some((q) => q.rule.id === r.id)
                              ? "Kịch bản đang có thông báo chờ xử lý. Hãy xử lý các thông báo trước khi xóa."
                              : "Lịch sử đã gửi vẫn được bảo toàn. Thao tác sẽ hủy cấu hình lịch quét.",
                            action: () => {
                              if (queue.some((q) => q.rule.id === r.id)) {
                                setDialog(null)
                                return
                              }
                              save(
                                "hoaloi-cn04-rules",
                                rules.filter((x) => x.id !== r.id),
                                setRules,
                              )
                              setDialog(null)
                            },
                          })
                        }
                      >
                        Xóa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          {!rules.length && (
            <EmptyState
              title="Chưa có kịch bản"
              description="Tạo kịch bản đầu tiên để thiết lập điều kiện nhắc nợ."
            >
              <Button onClick={() => setEdit({ ...blankRule })}>
                Tạo kịch bản
              </Button>
            </EmptyState>
          )}
        </Section>
      )}
      {tab === "rules" && edit && (
        <>
          <Section
            title={edit.id ? "Chỉnh sửa kịch bản" : "Tạo mới kịch bản"}
            readonly={false}
          >
            <div className="notification-form">
              {([
                ["name", "Tên kịch bản", "text"],
                ["days", "Số ngày trước hạn / quá hạn", "number"],
                ["minimum", "Hạn mức nợ tối thiểu (VNĐ)", "number"],
                ["idle", "Số ngày không phát sinh đơn mới", "number"],
                ["time", "Thời gian quét", "time"],
              ] as const).map(([key, label, type]) => (
                <TextField
                  key={key}
                  label={label}
                  type={type}
                  value={edit[key]}
                  error={errors[key]}
                  onChange={(v) => setEdit({ ...edit, [key]: v })}
                />
              ))}
              {([
                ["kind", "Loại thời hạn", ["Trước khi đến hạn", "Đã quá hạn"]],
                [
                  "severity",
                  "Mức độ nghiêm trọng",
                  ["Nhắc nhở", "Cảnh báo", "Nghiêm trọng"],
                ],
                ["channel", "Kênh gửi", ["Zalo", "SMS"]],
                ["frequency", "Tần suất", ["Hàng ngày", "Hàng tuần"]],
                ["active", "Trạng thái", ["true", "false"]],
              ] as const).map(([key, label, opts]) => (
                <div key={key}>
                  <SelectField
                    label={label}
                    value={edit[key]}
                    aria-invalid={!!errors[key]}
                    onChange={(e) =>
                      setEdit({ ...edit, [key]: e.target.value })
                    }
                  >
                    <option value="">Chọn {label.toLowerCase()}</option>
                    {opts.map((o) => (
                      <option key={o} value={o}>
                        {o === "true"
                          ? "Đang kích hoạt"
                          : o === "false"
                            ? "Ngừng kích hoạt"
                            : o}
                      </option>
                    ))}
                  </SelectField>
                  {errors[key] && (
                    <span className="field-error">{errors[key]}</span>
                  )}
                </div>
              ))}
            </div>
          </Section>
          <Section title="Nội dung tin nhắn mẫu" readonly={false}>
            <label>
              Nội dung mẫu
              <textarea
                ref={templateRef}
                className="template-input"
                value={edit.template}
                aria-invalid={!!errors.template}
                onChange={(e) => setEdit({ ...edit, template: e.target.value })}
              />
            </label>
            {errors.template && (
              <span className="field-error">{errors.template}</span>
            )}
            <div className="variable-chips">
              {variables.map((v) => (
                <Button
                  key={v}
                  variant="link"
                  onClick={() => {
                    const el = templateRef.current
                    const start = el?.selectionStart ?? edit.template.length
                    const end = el?.selectionEnd ?? start
                    setEdit({
                      ...edit,
                      template:
                        edit.template.slice(0, start) +
                        v +
                        edit.template.slice(end),
                    })
                    requestAnimationFrame(() => {
                      el?.focus()
                      el?.setSelectionRange(start + v.length, start + v.length)
                    })
                  }}
                >
                  {v}
                </Button>
              ))}
            </div>
            <Alert tone="info" title="Xem trước với dữ liệu giả lập">
              <p className="message-preview">
                {message(edit, [seed[0]]) ||
                  "Nội dung xem trước sẽ hiển thị khi bạn soạn tin nhắn."}
              </p>
            </Alert>
          </Section>
          <ActionBar hint="Nhập 0 nếu không xét số ngày không phát sinh đơn mới">
            <Button onClick={() => setEdit(null)}>Hủy bỏ</Button>
            <Button variant="primary" onClick={saveRule}>
              Lưu kịch bản
            </Button>
          </ActionBar>
        </>
      )}
      {tab === "queue" && (
        <>
          <Section
            title={`Danh sách chờ nhắc nợ (${queue.length})`}
            readonly={false}
          >
            <div className="notification-filters">
              <SelectField
                label="Kịch bản"
                value={ruleFilter}
                onChange={(e) => {
                  setRuleFilter(e.target.value)
                  setSelected([])
                }}
              >
                <option value="all">Tất cả kịch bản</option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Kênh gửi"
                value={channel}
                onChange={(e) => {
                  setChannel(e.target.value)
                  setSelected([])
                }}
              >
                <option value="all">Tất cả kênh</option>
                <option>Zalo</option>
                <option>SMS</option>
              </SelectField>
              <SelectField
                label="Mức độ"
                value={severity}
                onChange={(e) => {
                  setSeverity(e.target.value)
                  setSelected([])
                }}
              >
                <option value="all">Tất cả mức độ</option>
                <option>Nhắc nhở</option>
                <option>Cảnh báo</option>
                <option>Nghiêm trọng</option>
              </SelectField>
            </div>
            <DataTable label="Danh sách chờ duyệt">
              <thead>
                <tr>
                  <th>
                    <Check
                      label="Chọn tất cả thông báo"
                      checked={
                        queued.length > 0 &&
                        queued.every((q) => selected.includes(q.id))
                      }
                      onChange={() =>
                        setSelected(
                          queued.every((q) => selected.includes(q.id))
                            ? []
                            : queued.map((q) => q.id),
                        )
                      }
                    />
                  </th>
                  <th>Khách hàng / Công nợ</th>
                  <th>Kịch bản / Kênh</th>
                  <th>Nội dung dự kiến</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {queued.map((q) => {
                  const ds = queueDebts(q)
                  return (
                    <tr key={q.id}>
                      <td>
                        <Check
                          label={`Chọn ${ds[0]?.name || q.customer}`}
                          checked={selected.includes(q.id)}
                          onChange={() => toggle(q.id)}
                        />
                      </td>
                      <td>
                        <strong>{ds[0]?.name || q.customer}</strong>
                        <span className="cell-sub">
                          {q.customer} ·{" "}
                          {money(ds.reduce((s, d) => s + balance(d), 0))} VNĐ
                        </span>
                        <span className="cell-sub">
                          Quá hạn:{" "}
                          {Math.max(0, ...ds.map((d) => overdue(d) ?? 0))} ngày
                        </span>
                      </td>
                      <td>
                        {q.rule.name}
                        <span className="cell-sub">
                          {q.rule.channel} · {q.rule.severity}
                        </span>
                      </td>
                      <td>
                        <div className="queue-message">
                          {message(q.rule, ds)}
                        </div>
                      </td>
                      <td>
                        <Badge
                          tone={q.status === "Gửi lỗi" ? "error" : "warning"}
                        >
                          {q.status}
                        </Badge>
                        {q.error && <span className="cell-sub">{q.error}</span>}
                      </td>
                      <td>
                        <Button variant="link" onClick={() => setDetail(q)}>
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="link"
                          onClick={() => {
                            setCancel(q)
                            setReason("")
                          }}
                        >
                          Hủy nhắc
                        </Button>
                        {q.status === "Gửi lỗi" && (
                          <Button
                            variant="link"
                            onClick={() => {
                              setSelected([q.id])
                              setNotice({
                                tone: "info",
                                text: "Đã chọn bản ghi lỗi. Khắc phục nguyên nhân, sau đó duyệt và xác nhận gửi lại.",
                              })
                            }}
                          >
                            Thử gửi lại
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </DataTable>
            {!queued.length && (
              <EmptyState
                title="Hiện không có khoản công nợ nào trong danh sách chờ nhắc nợ"
                description="Thay đổi bộ lọc hoặc quay lại sau lần quét tiếp theo."
              >
                <Button onClick={onExit}>Thoát</Button>
              </EmptyState>
            )}
          </Section>
          {detail && (
            <Section title="Chi tiết thông báo">
              <dl className="fields">
                <Field label="Khách hàng">
                  {queueDebts(detail)[0]?.name || detail.customer}
                </Field>
                <Field label="Kênh gửi">{detail.rule.channel}</Field>
              </dl>
              <div className="basis message-preview">
                {message(detail.rule, queueDebts(detail))}
              </div>
              <DebtTable ds={queueDebts(detail)} />
              <Button variant="link" onClick={() => setDetail(null)}>
                Đóng chi tiết
              </Button>
            </Section>
          )}
          <ActionBar
            hint={`Đã chọn ${selected.length} thông báo · Chỉ gửi sau khi xác nhận`}
          >
            <Button onClick={onExit}>Thoát</Button>
            <Button
              variant="primary"
              disabled={!selected.length}
              onClick={confirmSend}
            >
              Duyệt và Gửi thông báo <Icon name="arrow" />
            </Button>
          </ActionBar>
        </>
      )}
      {tab === "history" && (
        <Section title="Lịch sử thông báo và nhắc nợ" readonly={false}>
          <DataTable label="Lịch sử thông báo">
            <thead>
              <tr>
                <th>Thời gian / Người lập</th>
                <th>Khách hàng</th>
                <th>Số tiền</th>
                <th>Thao tác / Kết quả</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.id}>
                  <td>
                    {h.time}
                    <span className="cell-sub">Kế toán</span>
                  </td>
                  <td>{h.customer}</td>
                  <td className="number">{money(h.amount)} VNĐ</td>
                  <td>{h.action}</td>
                  <td>
                    <div className="queue-message">
                      {h.detail || "Báo cáo lưu trong trình duyệt"}
                    </div>
                    {h.report && h.action === "Lưu báo cáo" && (
                      <Button
                        variant="link"
                        onClick={() => {
                          setTab("create")
                          setPreview(h.report!)
                          setNotice({
                            tone: "info",
                            text: "Bản lưu tại thời điểm lập. Số dư sẽ được kiểm tra lại trước khi phát hành.",
                          })
                        }}
                      >
                        Mở báo cáo
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
          {!history.length && (
            <EmptyState
              title="Chưa có lịch sử thông báo"
              description="Lịch sử sẽ xuất hiện sau khi lưu báo cáo hoặc xử lý thông báo."
            >
              <Button onClick={() => switchTab("create")}>Lập thông báo</Button>
            </EmptyState>
          )}
        </Section>
      )}
      <section className="demo">
        <div className="demo-content notification-demo">
          <Alert tone="info" title="Môi trường demo · Không gửi thông báo thật">
            Số dư và hạn thanh toán được đọc từ dữ liệu chung UC01/UC02 của bản demo.
            Kịch bản, hàng đợi và lịch sử gửi là mô phỏng trong trình duyệt;
            chưa có kết nối Zalo/SMS/Email hoặc lịch chạy ngầm thật. Ngày demo:
            {demoDate.split("-").reverse().join("/")}.
          </Alert>
          <SelectField
            label="Kịch bản gửi thử"
            value={demo}
            onChange={(e) => setDemo(e.target.value)}
          >
            <option value="normal">Gửi thành công (mô phỏng)</option>
            <option value="failure">Lỗi cổng gửi cho KH-002 (mô phỏng)</option>
          </SelectField>
        </div>
      </section>
      {dialog && (
        <div className="modal-backdrop">
          <div
            className="notification-modal"
            role="dialog"
            aria-modal="true"
            aria-label={dialog.title}
          >
            <Section title={dialog.title} readonly={false}>
              <p>{dialog.text}</p>
              <div className="modal-actions">
                <Button autoFocus onClick={() => setDialog(null)}>
                  Quay lại
                </Button>
                <Button variant="primary" onClick={dialog.action}>
                  Xác nhận
                </Button>
              </div>
            </Section>
          </div>
        </div>
      )}
      {cancel && (
        <div className="modal-backdrop">
          <div
            className="notification-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Hủy nhắc lần này"
          >
            <Section title="Hủy nhắc lần này" readonly={false}>
              <TextField
                label="Lý do hủy nhắc"
                value={reason}
                onChange={setReason}
              />
              <div className="modal-actions">
                <Button autoFocus onClick={() => setCancel(null)}>
                  Quay lại
                </Button>
                <Button
                  variant="primary"
                  disabled={!reason.trim()}
                  onClick={() => {
                    log("Đã hủy bởi Kế toán", queueDebts(cancel), reason.trim())
                    save(
                      "hoaloi-cn04-queue",
                      queue.filter((q) => q.id !== cancel.id),
                      setQueue,
                    )
                    setSelected((s) => s.filter((id) => id !== cancel.id))
                    setCancel(null)
                    setDetail(null)
                  }}
                >
                  Xác nhận hủy
                </Button>
              </div>
            </Section>
          </div>
        </div>
      )}
    </div>
  )
}
function TextField({
  label,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  error?: string
}) {
  return (
    <label>
      {label}
      <input
        type={type}
        value={value}
        aria-invalid={!!error}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}
function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <input
      className="debt-checkbox"
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
    />
  )
}
function DebtTable({
  ds,
  selected,
  toggle,
  selectAll,
}: {
  ds: Debt[]
  selected?: string[]
  toggle?: (id: string) => void
  selectAll?: () => void
}) {
  return (
    <DataTable label="Chi tiết khoản nợ">
      <thead>
        <tr>
          {selected && (
            <th>
              <Check
                label="Chọn tất cả khoản nợ"
                checked={
                  ds.length > 0 && ds.every((d) => selected.includes(d.id))
                }
                onChange={() => selectAll?.()}
              />
            </th>
          )}
          <th>Chứng từ / Khách hàng</th>
          <th>Hạn thanh toán</th>
          <th>Tình trạng</th>
          <th className="number">Giá trị gốc</th>
          <th className="number">Đã trả / Giảm trừ</th>
          <th className="number">Còn phải trả</th>
        </tr>
      </thead>
      <tbody>
        {ds.map((d) => (
          <tr key={d.id}>
            {selected && (
              <td>
                <Check
                  label={`Chọn ${d.id}`}
                  checked={selected.includes(d.id)}
                  onChange={() => toggle?.(d.id)}
                />
              </td>
            )}
            <td>
              <strong>{d.id}</strong>
              <span className="cell-sub">
                {d.date.split("-").reverse().join("/")}
              </span>
              <span className="cell-sub">
                {d.name} · {d.customer}
              </span>
            </td>
            <td>
              {d.due
                ? d.due.split("-").reverse().join("/")
                : "Chưa xác định hạn"}
            </td>
            <td>
              <Badge
                tone={
                  (overdue(d) ?? 0) > 7
                    ? "error"
                    : status(d) === "Quá hạn"
                      ? "warning"
                      : "info"
                }
              >
                {status(d)}
              </Badge>
              {overdue(d) !== null && (
                <span className="cell-sub">
                  {overdue(d)! > 0
                    ? `${overdue(d)} ngày quá hạn`
                    : overdue(d) === 0
                      ? "Thanh toán hôm nay"
                      : `Còn ${-overdue(d)!} ngày`}
                </span>
              )}
            </td>
            <td className="number">{money(d.amount)}</td>
            <td className="number">{money(d.paid)}</td>
            <td className="number amount">{money(balance(d))} VNĐ</td>
          </tr>
        ))}
      </tbody>
    </DataTable>
  )
}

function exportExcel(ds: Debt[], demoDate: string) {
  const xml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  const rows: (string | number)[][] = [
    ["HỢP TÁC XÃ HOA LỢI – THÔNG BÁO CÔNG NỢ"],
    [`Ngày nghiệp vụ: ${demoDate.split("-").reverse().join("/")}`],
    [
      "Khách hàng",
      "Mã khách hàng",
      "Chứng từ",
      "Ngày chứng từ",
      "Hạn thanh toán",
      "Giá trị gốc",
      "Đã trả / giảm trừ",
      "Còn phải trả (VNĐ)",
    ],
    ...ds.map((d) => [
      d.name,
      d.customer,
      d.id,
      d.date,
      d.due || "Chưa xác định hạn",
      d.amount,
      d.paid,
      balance(d),
    ]),
    [
      "Tổng còn phải trả",
      "",
      "",
      "",
      "",
      "",
      "",
      ds.reduce((sum, d) => sum + balance(d), 0),
    ],
  ]
  const content = `<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Thông báo công nợ"><Table>${rows.map((row) => `<Row>${row.map((v) => `<Cell><Data ss:Type="${typeof v === "number" ? "Number" : "String"}">${xml(String(v))}</Data></Cell>`).join("")}</Row>`).join("")}</Table></Worksheet></Workbook>`
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/xml;charset=utf-8" }),
  )
  const link = document.createElement("a")
  link.href = url
  link.download = "Thong-bao-cong-no.xml"
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
