import { useEffect, useRef } from 'react'
import type { OrderLine, OrderReceipt } from '../lib/orders'

interface Props {
  receipt: OrderReceipt | null
  lines: OrderLine[]
  onDone: () => void
}

/** A calm, full-screen receipt: a check that draws itself, then the details. */
export function OrderConfirmation({ receipt, lines, onDone }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const open = !!receipt

  useEffect(() => {
    if (!open) return
    document.documentElement.classList.add('scroll-locked')
    headingRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onDone()
    document.addEventListener('keydown', onKey)
    return () => {
      document.documentElement.classList.remove('scroll-locked')
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onDone])

  if (!receipt) return null
  const total = lines.reduce((n, l) => n + l.price * l.qty, 0)

  return (
    <div className="confirm" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="confirm__inner">
        <svg className="confirm__check" viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="32" r="29" />
          <path d="M20 33.5 28.5 42 45 24" />
        </svg>
        <p className="kicker confirm__step" style={{ '--i': 0 } as React.CSSProperties}>
          Order received
        </p>
        <h2 id="confirm-title" ref={headingRef} tabIndex={-1} className="display display--md confirm__step" style={{ '--i': 1 } as React.CSSProperties}>
          Order #{receipt.orderNumber}
        </h2>
        <p className="confirm__msg confirm__step" style={{ '--i': 2 } as React.CSSProperties}>
          Your food is being prepared.
          <br />
          We’ll bring it to <strong>Table {receipt.table}</strong>.
        </p>
        <ul className="confirm__lines confirm__step" style={{ '--i': 3 } as React.CSSProperties}>
          {lines.map((l) => (
            <li key={l.id}>
              <span>
                {l.qty} × {l.name}
              </span>
              <span>₹{l.qty * l.price}</span>
            </li>
          ))}
          <li className="confirm__total">
            <span>Total</span>
            <span>₹{total}</span>
          </li>
        </ul>
        <button type="button" className="btn btn--primary btn--lg btn--block confirm__step" style={{ '--i': 4 } as React.CSSProperties} onClick={onDone}>
          Back to the menu
        </button>
      </div>
    </div>
  )
}
