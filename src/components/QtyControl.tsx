import { useEffect, useRef } from 'react'
import { useCart } from '../hooks/useCart'
import type { MenuItem } from '../data/menu'

/**
 * "+ Add" that grows into "− 1 +". Both states are always in the DOM so the
 * pill can morph; the hidden one is inert. Focus follows the change so
 * keyboard and switch users never lose their place.
 */
export function QtyControl({ item, size = 'md' }: { item: MenuItem; size?: 'md' | 'sm' }) {
  const { quantities, add, remove } = useCart()
  const qty = quantities[item.id] ?? 0
  const active = qty > 0
  const addRef = useRef<HTMLButtonElement>(null)
  const plusRef = useRef<HTMLButtonElement>(null)
  const interacted = useRef(false)
  const prev = useRef(qty)

  useEffect(() => {
    if (interacted.current) {
      if (prev.current === 0 && qty > 0) plusRef.current?.focus({ preventScroll: true })
      if (prev.current > 0 && qty === 0) addRef.current?.focus({ preventScroll: true })
    }
    interacted.current = false
    prev.current = qty
  }, [qty])

  const doAdd = () => {
    interacted.current = true
    add(item.id)
  }
  const doRemove = () => {
    interacted.current = true
    remove(item.id)
  }

  return (
    <div className={`qty qty--${size}`} data-active={active || undefined}>
      <button
        ref={addRef}
        type="button"
        className="qty__add"
        onClick={doAdd}
        inert={active}
        aria-label={`Add ${item.name}, ₹${item.price}`}
      >
        <span aria-hidden="true">+</span> Add
      </button>
      <div className="qty__stepper" inert={!active}>
        <button type="button" className="qty__btn" onClick={doRemove} aria-label={`Remove one ${item.name}`}>
          <span aria-hidden="true">−</span>
        </button>
        <span className="qty__n" aria-label={`${qty} ${item.name} in order`}>
          <span key={qty} className="qty__digit">
            {qty}
          </span>
        </span>
        <button ref={plusRef} type="button" className="qty__btn" onClick={doAdd} aria-label={`Add one more ${item.name}`}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>
  )
}
