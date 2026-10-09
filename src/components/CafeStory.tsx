import type { Still } from '../data/cafe'
import { cafe } from '../data/cafe'
import { stillSrc, stillSrcSet } from '../lib/media'

function Plate({ still, alt, caption, tall = false }: { still: Still; alt: string; caption?: string; tall?: boolean }) {
  return (
    <figure className={`story-plate${tall ? ' story-plate--tall' : ''}`} data-reveal>
      <div className="story-plate__clip">
        <img
          src={stillSrc(still)}
          srcSet={stillSrcSet(still)}
          sizes="(min-width: 1024px) 60vw, 100vw"
          alt={alt}
          loading="lazy"
          decoding="async"
          width={504}
          height={624}
        />
      </div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

/** Picks up exactly where the flight ends: inside, at the window wall. */
export function CafeStory() {
  return (
    <section id="story" className="story" aria-labelledby="story-title">
      <div className="story__arrival">
        <p className="kicker" data-reveal>
          {cafe.place} · {cafe.altitude}
        </p>
        <h2 id="story-title" className="display" data-reveal>
          You made it.
        </h2>
        <p className="story__lede" data-reveal>
          <span>Take a seat.</span>
          <span>Stay a while.</span>
        </p>
      </div>

      <Plate still="interior-windows" alt="Blue booths and wooden chairs facing a wall of glass and snow peaks" caption="Every booth faces the mountains." tall />

      <p className="story__line" data-reveal>
        Coffee, chai and hot food — <em>a long way from anywhere.</em>
      </p>

      <Plate still="terrace" alt="An open-air terrace with wooden tables above the valley" caption="Tea on the terrace, valley below." tall />

      <div className="story__pair">
        <Plate still="flags" alt="Prayer flags strung against the evening sky" caption="Flags at the door" />
        <Plate still="games-room" alt="Foosball tables beneath strings of colourful prayer flags" caption="For when it snows" />
      </div>
    </section>
  )
}
