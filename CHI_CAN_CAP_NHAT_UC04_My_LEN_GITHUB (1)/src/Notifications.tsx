import { useMemo } from "react"
import DebtNotifications, { type Debt } from "./uc04/DebtNotifications"
import { getState, debtRows, customer } from "./store"
import "./uc04/styles.css"

// The current team's store is the source of truth for balances and payment dates.
// UC04 may read these amounts but cannot change UC01/UC02 accounting balances.
function readDebts(s: any): Debt[] {
  return debtRows(s).map((i: any) => {
    const c = customer(s, i.customerId)
    const remaining = Number(i.outstanding) || 0
    const gross = Math.max(Number(i.gross) || 0, remaining)
    return {
      id: String(i.id),
      customer: String(i.customerId),
      name: String(c?.name || i.customerId),
      date: String(i.issuedAt || s.clock),
      due: String(i.dueAt || ""),
      amount: gross,
      paid: gross - remaining,
      group: String(c?.group || "Khác"),
      idle: 0, // Data source has no verified last-order gap; not inferred.
      clock: String(s.clock),
    }
  })
}

export default function Notifications({ s, notify, onExit }: any) {
  const data = useMemo(() => readDebts(s), [s.revision, s.sessionId])
  return (
    <div className="uc04-module" aria-label="UC04 - Thông báo công nợ">
      <DebtNotifications
        sharedDebts={data}
        getLatestDebts={() => readDebts(getState())}
        demoDate={s.clock}
        onExit={onExit}
      />
    </div>
  )
}
