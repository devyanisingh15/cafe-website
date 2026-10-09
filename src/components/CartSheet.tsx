import { useCart } from '../hooks/useCart'
import { menuById } from '../data/menu'
import { FoodArt } from './FoodArt'
import { QtyControl } from './QtyControl'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  table: string | null
  onChangeTable: () => void
  onPlace: () => void
  placing: boolean
  error: string | null
  note: string
  onNote: (s: string) => void
}

export function CartSheet({ open, onClose, table, onChangeTable, onPlace, placing, error, note, onNote }: Props) {
  const { lines, count, subtotal } = useCart()

  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelledBy="cart-title"
      className="cart"
      header={
        <div className="cart__head">
          <div>
            <h2 id="cart-title" className="cart__title">
              Your order
            </h2>
            <button type="button" className="link-btn" onClick={onChangeTable}>
              {table ? `For Table ${table} · change` : 'Select your table'}
            </button>
          </div>
          <button type="button" className="icon-btn icon-btn--soft" aria-label="Close order" onClick={onClose}>
            <span className="close-x" aria-hidden="true" />
          </button>
        </div>
      }
      footer={
        count > 0 && (
          <>
            <div className="cart__total">
              <span>Subtotal</span>
              <span className="price">₹{subtotal}</span>
            </div>
            {error && (
              <p className="cart__error" role="alert">
                {error}
              </p>
            )}
            <button type="button" className="btn btn--primary btn--lg btn--block" onClick={table ? onPlace : onChangeTable} disabled={placing} aria-busy={placing}>
              {placing ? 'Sending to the kitchen…' : table ? 'Place Order' : 'Choose your table to order'}
            </button>
          </>
        )
      }
    >
      {count === 0 ? (
        <p className="cart__empty">Nothing here yet. Add something warm.</p>
      ) : (
        <>
          <ul className="cart__lines">
            {lines.map((l) => {
              const item = menuById.get(l.id)!
              return (
                <li key={l.id} className="cart__line">
                  <span className="cart__thumb" aria-hidden="true">
                    <FoodArt kind={item.art.kind} bg={item.art.bg} tint={item.art.tint} label="" />
                  </span>
                  <span className="cart__name">{l.name}</span>
                  <span className="cart__price price">₹{l.price * l.qty}</span>
                  <span className="cart__qty">
                    <QtyControl item={item} size="sm" />
                  </span>
                </li>
              )
            })}
          </ul>
          <label className="cart__note">
            <span>Anything we should know?</span>
            <textarea
              rows={2}
              value={note}
              maxLength={200}
              onChange={(e) => onNote(e.target.value)}
              placeholder="Less spicy, no sugar, allergies…"
            />
          </label>
        </>
      )}
    </Sheet>
  )
}
