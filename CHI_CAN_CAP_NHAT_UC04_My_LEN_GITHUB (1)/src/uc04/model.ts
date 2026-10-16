export const cases = [
  "Bán hàng chưa thu đủ tiền",
  "Vận chuyển thu riêng",
  "Điều chỉnh tăng",
]
export const scenarios = [
  "Bình thường",
  "Không có kết quả tìm kiếm",
  "Thiếu dữ liệu căn cứ hoặc khách hàng",
  "Chứng từ vừa được người khác ghi nhận",
  "Dữ liệu thay đổi sau khi mở chi tiết",
  "Chứng từ bị hủy",
  "Kỳ hạch toán đã đóng",
  "Hạch toán không hoàn tất",
  "Chưa rõ kết quả hạch toán",
  "Bút toán đã tạo nhưng cập nhật công nợ chưa hoàn tất",
  "Không có quyền ghi nhận",
  "Chứng từ chưa được duyệt",
  "Cấu hình định khoản không cân đối",
]
export type Doc = {
  id: string
  customer: string
  name: string
  type: number
  amount: number
  allocated: number
  balance: number
  limit: number | null
  order?: string
  contract?: string
  delivery?: string
  orders?: string[]
  deliveries?: string[]
  basis: string[]
  due: string | null
  journal: string | null
  journalDate?: string
  posted: boolean
  saved: boolean
  reflected: boolean
  unknown: boolean
  process?: string
  entry?: string
  version: number
  approved: boolean
  active: boolean
}
export function initialDocs(): Doc[] {
  const ids = [
    "HD-001",
    "HD-002",
    "HD-003",
    "HD-004",
    "HD-005",
    "VC-001",
    "DC-001",
    "HD-006",
  ]
  return ids.map((id, i) => ({
    id,
    customer: `KH-00${i + 1}`,
    name: `Khách hàng ${String.fromCharCode(65 + i)}`,
    type: i === 5 ? 1 : i === 6 ? 2 : 0,
    amount: [10, 6, 8, 6, 10, 1, 2, 5][i] * 1e6,
    allocated: i === 4 || i === 6 ? 3e6 : 0,
    balance: [0, 5, 0, 5, 0, 2, 7, 5][i] * 1e6,
    limit: i === 5 ? null : i === 3 ? 10e6 : 30e6,
    order: [0, 1, 4, 7].includes(i) ? `DH-00${i + 1}` : undefined,
    orders: [0, 1, 4, 7].includes(i) ? [`DH-00${i + 1}`] : undefined,
    contract: i === 2 ? "HDONG-001" : i === 3 ? "HDONG-002" : undefined,
    delivery: i === 2 ? "Đợt 1" : i === 3 ? "Đợt 2" : undefined,
    deliveries: i === 2 ? ["Đợt 1"] : i === 3 ? ["Đợt 2"] : undefined,
    basis:
      i === 5
        ? [
            "TTVC-001 - Thỏa thuận khách chịu phí vận chuyển",
            "Hóa đơn đầu ra riêng của HTX - Khách hàng trả phí cho HTX",
          ]
        : i === 6
          ? [
              "DC-001 - Điều chỉnh tăng hóa đơn HD-GOC-001",
              "CN-001 - Khoản nợ gốc của KH-007",
            ]
          : [
              `Hóa đơn ${id} - Bán hàng đã được duyệt`,
              i === 2 || i === 3
                ? "Biên bản giao nhận theo đợt đã xác nhận"
                : `Đơn hàng DH-00${i + 1} - Căn cứ bán hàng`,
            ],
    due: i === 5 ? null : "12/11/2026",
    journal: i === 7 ? "BT-006" : null,
    journalDate: i === 7 ? "13/10/2026" : undefined,
    posted: i === 7,
    saved: false,
    reflected: i === 7,
    unknown: false,
    version: 1,
    approved: true,
    active: true,
  }))
}
export const money = (n: number) => new Intl.NumberFormat("vi-VN").format(n)
export const remaining = (d: Doc) =>
  d.type === 2 ? 10e6 - d.allocated + d.amount : d.amount - d.allocated
export const delta = (d: Doc) =>
  d.reflected ? 0 : d.type === 2 ? d.amount : remaining(d)
export const projected = (d: Doc) => d.balance + delta(d)
export const orderLinks = (d: Doc) =>
  d.orders ?? (d.order ? [d.order] : d.id === "HD-006" ? ["DH-008"] : [])
export const deliveryLinks = (d: Doc) =>
  d.deliveries ?? (d.delivery ? [d.delivery] : [])
export const pendingDocs = (docs: Doc[]) =>
  docs.filter(
    (d) => !d.saved && d.active && d.approved && !d.process && !d.unknown,
  )
export const filterDocs = (docs: Doc[], filter: string, query: string) =>
  pendingDocs(docs).filter(
    (d) =>
      (filter === "all" || d.type === Number(filter)) &&
      `${d.id} ${d.customer} ${d.name} ${d.contract ?? ""} ${orderLinks(d).join(" ")}`
        .toLocaleLowerCase("vi")
        .includes(query.trim().toLocaleLowerCase("vi")),
  )
export const lines = (d: Doc) => [
  { account: "131 - Phải thu khách hàng", side: "Nợ", amount: d.amount },
  {
    account:
      d.type === 1
        ? "5113 - Doanh thu dịch vụ"
        : d.type === 2
          ? "5111 - Điều chỉnh doanh thu"
          : "5111 - Doanh thu bán hàng",
    side: "Có",
    amount: d.amount / 1.1,
  },
  {
    account: "33311 - Thuế GTGT đầu ra",
    side: "Có",
    amount: d.amount - d.amount / 1.1,
  },
]
export type Outcome = {
  doc: Doc
  kind: "success" | "validation" | "incomplete"
  message: string
}
export function record(current: Doc, snapshot: Doc, scenario: string): Outcome {
  let d = { ...current }
  const fail = (message: string): Outcome => ({
    doc: d,
    kind: "validation",
    message,
  })
  if (scenario === scenarios[10])
    return fail("Bạn không có quyền ghi nhận công nợ")
  if (!d.approved || scenario === scenarios[11])
    return fail("Chứng từ chưa được duyệt")
  if (!d.active || scenario === scenarios[5])
    return fail("Chứng từ đã bị hủy, không còn hiệu lực")
  if (d.unknown || (d.process && !d.reflected))
    return {
      doc: d,
      kind: "incomplete",
      message: d.saved
        ? "Đã lưu phát sinh nhưng cập nhật công nợ chưa hoàn tất - Cần đối soát, không tạo lại bút toán"
        : "Giao dịch đang chờ đối soát, không tạo lại bút toán",
    }
  if (d.saved)
    return fail(
      "Khoản phải thu đã được ghi nhận, không tạo phát sinh hoặc bút toán thứ hai",
    )
  if (
    !d.customer ||
    !d.basis.length ||
    d.amount <= 0 ||
    (d.type === 2 && !d.basis.some((b) => b.includes("CN-001")))
  )
    return fail("Thiếu dữ liệu khách hàng, căn cứ hoặc khoản nợ gốc hợp lệ")
  if (
    scenario === scenarios[4] ||
    JSON.stringify(d) !== JSON.stringify(snapshot)
  ) {
    d.version++
    d.due = "20/11/2026"
    return fail("Dữ liệu đã thay đổi, vui lòng xem lại trước khi ghi nhận")
  }
  if (!d.posted) {
    if (scenario === scenarios[6])
      return fail("Kỳ hạch toán tháng 10/2026 đã đóng")
    if (scenario === scenarios[12])
      return fail(
        "Cấu hình định khoản không hợp lệ - Tổng Nợ không bằng tổng Có",
      )
    const entries = lines(d)
    if (
      Math.abs(
        entries[0].amount - entries.slice(1).reduce((s, e) => s + e.amount, 0),
      ) > 0.01
    )
      return fail("Định khoản không cân đối")
    d.process = `XL-${d.id}-001`
    if (scenario === scenarios[7] || scenario === scenarios[8]) {
      d.unknown = scenario === scenarios[8]
      return {
        doc: d,
        kind: "incomplete",
        message: d.unknown
          ? "Chưa rõ kết quả tại công đoạn tạo bút toán - Cần đối soát trước khi xử lý tiếp"
          : "Hạch toán không hoàn tất tại công đoạn tạo bút toán - Chưa lưu phát sinh, chưa cập nhật công nợ",
      }
    }
    d.journal = `BT-${d.id}`
    d.journalDate = "13/10/2026"
    d.posted = true
  }
  d.entry = `PS-${d.id}`
  d.saved = true
  if (scenario === scenarios[9]) {
    d.process ||= `XL-${d.id}-001`
    return {
      doc: d,
      kind: "incomplete",
      message:
        "Đã tạo bút toán và lưu phát sinh - Cập nhật công nợ chưa hoàn tất, cần đối soát theo mã xử lý",
    }
  }
  d.balance = projected(d)
  d.reflected = true
  return { doc: d, kind: "success", message: "Ghi nhận công nợ thành công" }
}
