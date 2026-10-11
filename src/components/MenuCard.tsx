import { memo } from 'react'
import { dietLabel, type MenuItem } from '../data/menu'
import { DishImage } from './DishImage'
import { QtyControl } from './QtyControl'

const SPICE = ['', 'Mild', 'Medium', 'Hot'] as const

function MenuCardImpl({ item, eager = false }: { item: MenuItem; eager?: boolean }) {
  const spice = item.spice ?? 0
  return (
    <article className="card" aria-labelledby={`item-${item.id}`} data-soldout={item.soldOut || undefined}>
      <div className="card__media">
        <DishImage item={item} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw" eager={eager} />
        {item.soldOut ? <span className="card__tag card__tag--out">Sold out today</span> : item.tag && <span className="card__tag">{item.tag}</span>}
      </div>
      <div className="card__body">
        <h3 id={`item-${item.id}`} className="card__name">
          <span className={`diet diet--${item.diet}`} role="img" aria-label={dietLabel[item.diet]} />
          {item.name}
        </h3>
        <p className="card__desc">{item.description}</p>
        <ul className="card__meta">
          <li>{item.prepMins} min</li>
          {item.diet === 'vegan' && <li>Vegan</li>}
          {spice > 0 && (
            <li className="card__spice" aria-label={`${SPICE[spice]} spice`}>
              <span aria-hidden="true">
                {Array.from({ length: 3 }, (_, i) => (
                  <span key={i} className={i < spice ? 'on' : undefined} />
                ))}
              </span>
              {SPICE[spice]}
            </li>
          )}
        </ul>
        <div className="card__foot">
          <span className="price">₹{item.price}</span>
          {item.soldOut ? (
            <span className="card__soldout" aria-label={`${item.name} is sold out today`}>
              Sold out
            </span>
          ) : (
            <QtyControl item={item} />
          )}
        </div>
      </div>
    </article>
  )
}

export const MenuCard = memo(MenuCardImpl)
