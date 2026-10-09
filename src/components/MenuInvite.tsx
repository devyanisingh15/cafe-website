import { Link } from 'react-router-dom'
import { menuById } from '../data/menu'
import { FoodArt } from './FoodArt'

const PEEK = ['cappuccino', 'veg-momos', 'apple-crumble'].map((id) => menuById.get(id)!)

/**
 * The hand-off from story to ordering: "your table is ready", and the menu
 * rising out of the page like a sheet. The link morphs into /menu with a
 * view transition where the browser supports it.
 */
export function MenuInvite() {
  return (
    <section className="invite" aria-labelledby="invite-title">
      <div className="invite__copy">
        <p className="invite__line" data-reveal>
          You’re here.
        </p>
        <h2 id="invite-title" className="display display--md" data-reveal>
          Your table is ready.
        </h2>
        <p className="invite__sub" data-reveal>
          Order directly from your phone — we’ll bring it over.
        </p>
        <Link to="/menu" viewTransition className="btn btn--primary btn--lg invite__cta" data-reveal>
          View Menu
          <span aria-hidden="true">→</span>
        </Link>
      </div>
      <Link to="/menu" viewTransition className="invite__sheet" data-reveal tabIndex={-1} aria-hidden="true">
        <span className="invite__grab" />
        {PEEK.map((item) => (
          <span key={item.id} className="invite__row">
            <span className="invite__thumb">
              <FoodArt kind={item.art.kind} bg={item.art.bg} tint={item.art.tint} label="" />
            </span>
            <span className="invite__name">{item.name}</span>
            <span className="invite__price">₹{item.price}</span>
          </span>
        ))}
      </Link>
    </section>
  )
}
