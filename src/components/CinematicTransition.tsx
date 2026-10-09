import { useImperativeHandle, useRef, type Ref } from 'react'
import { journeyChapters, type Still } from '../data/cafe'
import { stillSrc, stillSrcSet } from '../lib/media'

export interface CinematicHandle {
  update: (progress: number) => void
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const HOLD = 0.035 // fully visible within ±HOLD of a chapter's `at`
const FADE = 0.06 // then fades over this much progress

/**
 * Everything layered over the flight: the chapter lines that surface as the
 * camera passes each landmark, the progress rail, and the veil that darkens
 * the last frames so the stage hands off seamlessly to "You made it."
 * Writes styles directly — no React renders while scrolling.
 */
export function CinematicTransition({ ref }: { ref?: Ref<CinematicHandle> }) {
  const chapters = useRef<(HTMLDivElement | null)[]>([])
  const fill = useRef<HTMLDivElement>(null)
  const veil = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      update(p) {
        journeyChapters.forEach((c, i) => {
          const el = chapters.current[i]
          if (!el) return
          const d = p - c.at
          const o = clamp01(1 - (Math.abs(d) - HOLD) / FADE)
          el.style.opacity = String(o)
          el.style.transform = `translate3d(0, ${(-d * 420).toFixed(1)}px, 0)`
          el.style.filter = o > 0.98 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`
          el.style.visibility = o > 0 ? 'visible' : 'hidden'
        })
        if (fill.current) fill.current.style.transform = `scaleY(${p.toFixed(4)})`
        if (veil.current) veil.current.style.opacity = String(clamp01((p - 0.9) / 0.1))
      },
    }),
    [],
  )

  return (
    <>
      <div className="journey-chapters">
        {journeyChapters.map((c, i) => (
          <div
            key={c.at}
            className="journey-chapter"
            ref={(el) => {
              chapters.current[i] = el
            }}
          >
            <p className="kicker">{c.kicker}</p>
            <p className="journey-chapter__lines">
              {c.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <div className="journey-rail" aria-hidden="true">
        <div className="journey-rail__fill" ref={fill} />
      </div>
      <div className="journey-veil" ref={veil} aria-hidden="true" />
    </>
  )
}

/**
 * Reduced-motion / data-saver version of the journey: the same beats as
 * still photographs with a gentle fade, no scroll-linked motion.
 */
const STILLS: Still[] = ['cafe-village', 'cafe-aerial', 'storefront', 'flags']

export function JourneyStills() {
  return (
    <div className="journey-stills" id="arrive">
      {journeyChapters.map((c, i) => (
        <figure key={c.at} className="journey-still" data-reveal>
          <img
            src={stillSrc(STILLS[i])}
            srcSet={stillSrcSet(STILLS[i])}
            sizes="100vw"
            alt=""
            loading="lazy"
            decoding="async"
            width={504}
            height={624}
          />
          <figcaption>
            <p className="kicker">{c.kicker}</p>
            <p className="journey-chapter__lines">
              {c.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
