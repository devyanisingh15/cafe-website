import { gallery } from '../data/cafe'
import { stillSrc, stillSrcSet } from '../lib/media'

/** Swipeable on phones (scroll-snap, native momentum), a grid on desktop. */
export function CafeGallery() {
  return (
    <section id="space" className="gallery" aria-labelledby="gallery-title">
      <header className="gallery__head">
        <p className="kicker" data-reveal>
          The space
        </p>
        <h2 id="gallery-title" className="display display--md" data-reveal>
          Glass, timber <em>&amp;</em> a view.
        </h2>
      </header>
      <ul className="gallery__track" aria-label="Photos of the café — swipe to see more">
        {gallery.map((g) => (
          <li key={g.still} className="gallery__item">
            <figure>
              <img
                src={stillSrc(g.still, 800)}
                srcSet={stillSrcSet(g.still)}
                sizes="(min-width: 1024px) 30vw, 78vw"
                alt={g.alt}
                loading="lazy"
                decoding="async"
                width={504}
                height={624}
              />
              <figcaption>{g.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
