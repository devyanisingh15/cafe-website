import type { Ref } from 'react'
import { Link } from 'react-router-dom'
import { arrivalPicks } from '../data/cafe'
import { categories, menuById } from '../data/menu'
import { useCart } from '../hooks/useCart'
import { normaliseTable } from '../hooks/useTableNumber'
import { FoodArt } from './FoodArt'
import { QtyControl } from './QtyControl'

const PICKS = arrivalPicks.map((id) => menuById.get(id)!)

function rememberedTable() {
  try {
    return normaliseTable(sessionStorage.getItem('havana:table'))
  } catch {
    return null
  }
}

/**
 * The menu the flight lands on. It stays out of the page (inert, hidden)
 * until the film has finished, then rises over the settled interior shot like
 * a sheet slid across the table. Items can be added right here; the full
 * menu is one tap away and the cart carries over.
 */
export function HeroMenu({ open, headingRef }: { open: boolean; headingRef?: Ref<HTMLHeadingElement> }) {
  const { count, subtotal } = useCart()
  const table = rememberedTable()
  const menuHref = table ? `/menu?table=${table}` : '/menu'

  return (
    <div className="arrival" data-open={open || undefined} inert={!open} aria-hidden={!open}>
      <div className="arrival__welcome">
        <p className="arrival__line">You’re here.</p>
        <h2 className="display display--md arrival__title" ref={headingRef} tabIndex={-1}>
          Your table is ready.
        </h2>
      </div>

      <div className="arrival__sheet" role="region" aria-label="Menu">
        <span className="arrival__grab" aria-hidden="true" />
        <div className="arrival__head">
          <p className="arrival__ask">What would you like?</p>
          {table && <span className="arrival__table">Table {table}</span>}
        </div>

        <nav className="arrival__cats" aria-label="Menu categories">
          {categories.map((c) => (
            <Link key={c.id} to={`${menuHref}#cat-${c.id}`} viewTransition className="arrival__cat">
              {c.label}
            </Link>
          ))}
        </nav>

        <ul className="arrival__picks">
          {PICKS.map((item) => (
            <li key={item.id} className="arrival__pick">
              <span className="arrival__thumb" aria-hidden="true">
                <FoodArt kind={item.art.kind} bg={item.art.bg} tint={item.art.tint} label="" />
              </span>
              <span className="arrival__name">
                {item.name}
                <span className="arrival__price">₹{item.price}</span>
              </span>
              <QtyControl item={item} size="sm" />
            </li>
          ))}
        </ul>

        <Link to={menuHref} viewTransition className="btn btn--primary btn--lg btn--block arrival__cta">
          {count > 0 ? (
            <>
              View order · {count} {count === 1 ? 'item' : 'items'} · ₹{subtotal}
            </>
          ) : (
            <>
              Open the full menu <span aria-hidden="true">→</span>
            </>
          )}
        </Link>
      </div>
    </div>
  )
}
