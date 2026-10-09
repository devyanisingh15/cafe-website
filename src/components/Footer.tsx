import { cafe } from '../data/cafe'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer id="visit" className="footer" aria-labelledby="visit-title">
      <h2 id="visit-title" className="display display--md" data-reveal>
        Come <em>up</em> and see us.
      </h2>
      <dl className="footer__facts" data-reveal>
        <div>
          <dt>Where</dt>
          <dd>{cafe.address}</dd>
        </div>
        <div>
          <dt>When</dt>
          <dd>{cafe.hours}</dd>
        </div>
      </dl>
      <div className="footer__actions" data-reveal>
        <a className="btn btn--ghost" href={cafe.mapsUrl} target="_blank" rel="noreferrer">
          Directions <span aria-hidden="true">↗</span>
        </a>
        <a className="btn btn--ghost" href={cafe.instagram} target="_blank" rel="noreferrer">
          Instagram <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="footer__base">
        <Logo />
        <small>
          © {new Date().getFullYear()} {cafe.name}, {cafe.place}. Footage from {cafe.instagramHandle}.
        </small>
      </div>
    </footer>
  )
}
