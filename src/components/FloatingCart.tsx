import { useCart } from '../hooks/useCart'

/** Bottom bar on phones, a compact pill at bottom-right on desktop. */
export function FloatingCart({ onOpen, hidden }: { onOpen: () => void; hidden: boolean }) {
  const { count, subtotal } = useCart()
  const show = count > 0 && !hidden
  return (
    <div className="float-cart" data-show={show || undefined} inert={!show}>
      <button type="button" className="float-cart__btn" onClick={onOpen} aria-haspopup="dialog">
        <span className="float-cart__count">
          <span key={count} className="float-cart__badge">
            {count}
          </span>{' '}
          {count === 1 ? 'item' : 'items'}
        </span>
        <span className="float-cart__total">₹{subtotal}</span>
        <span className="float-cart__cta">
          View order <span aria-hidden="true">↑</span>
        </span>
      </button>
    </div>
  )
}
