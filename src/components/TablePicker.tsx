import { TABLES } from '../hooks/useTableNumber'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  current: string | null
  onClose: () => void
  onPick: (t: string) => void
}

export function TablePicker({ open, current, onClose, onPick }: Props) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      labelledBy="table-title"
      className="table-picker"
      header={
        <div className="cart__head">
          <div>
            <h2 id="table-title" className="cart__title">
              Select your table
            </h2>
            <p className="muted">The number is on the card at your table.</p>
          </div>
          <button type="button" className="icon-btn icon-btn--soft" aria-label="Close" onClick={onClose}>
            <span className="close-x" aria-hidden="true" />
          </button>
        </div>
      }
    >
      <div className="table-grid" role="group" aria-label="Tables">
        {TABLES.map((t) => (
          <button
            key={t}
            type="button"
            className="table-grid__btn"
            aria-pressed={current === t}
            aria-label={`Table ${t}`}
            onClick={() => onPick(t)}
          >
            {t}
          </button>
        ))}
      </div>
    </Sheet>
  )
}
