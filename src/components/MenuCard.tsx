import { memo } from 'react'
import type { MenuItem } from '../data/menu'
import { FoodArt } from './FoodArt'
import { QtyControl } from './QtyControl'

function MenuCardImpl({ item, eager = false }: { item: MenuItem; eager?: boolean }) {
  return (
    <article className="card" aria-labelledby={`item-${item.id}`}>
      <div className="card__media">
        {item.photo ? (
          <img
            src={`${item.photo}-800.webp`}
            srcSet={`${item.photo}-400.webp 400w, ${item.photo}-800.webp 800w`}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            alt={item.name}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : (
          <FoodArt kind={item.art.kind} bg={item.art.bg} tint={item.art.tint} label={item.name} />
        )}
        {item.tag && <span className="card__tag">{item.tag}</span>}
      </div>
      <div className="card__body">
        <h3 id={`item-${item.id}`} className="card__name">
          <span className={`diet diet--${item.veg ? 'veg' : 'nonveg'}`} role="img" aria-label={item.veg ? 'Vegetarian' : 'Non-vegetarian'} />
          {item.name}
        </h3>
        <p className="card__desc">{item.description}</p>
        <div className="card__foot">
          <span className="price">₹{item.price}</span>
          <QtyControl item={item} />
        </div>
      </div>
    </article>
  )
}

export const MenuCard = memo(MenuCardImpl)
