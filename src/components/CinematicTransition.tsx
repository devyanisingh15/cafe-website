import { useImperativeHandle, useRef, type Ref } from 'react'
import { flightChapters } from '../data/cafe'

export interface CinematicHandle {
  /** Film time in seconds, and the film's length. */
  update: (t: number, duration: number) => void
}

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)
const FADE = 0.55 // seconds to fade a line in or out

/**
 * Everything layered over the flight while it plays: the chapter lines that
 * surface as the camera passes each landmark, and a hairline of progress.
 * Written imperatively from the film's clock — no React renders per frame.
 */
export function CinematicTransition({ ref }: { ref?: Ref<CinematicHandle> }) {
  const chapters = useRef<(HTMLDivElement | null)[]>([])
  const bar = useRef<HTMLDivElement>(null)

  useImperativeHandle(
    ref,
    () => ({
      update(t, duration) {
        flightChapters.forEach((c, i) => {
          const el = chapters.current[i]
          if (!el) return
          const o = clamp01(Math.min((t - (c.from - FADE)) / FADE, (c.to + FADE - t) / FADE))
          // Lines drift up past the lens, as if the camera were moving under them.
          const drift = (t - (c.from + c.to) / 2) * -14
          el.style.opacity = String(o)
          el.style.transform = `translate3d(0, ${drift.toFixed(1)}px, 0)`
          el.style.filter = o > 0.98 ? 'none' : `blur(${((1 - o) * 6).toFixed(1)}px)`
          el.style.visibility = o > 0 ? 'visible' : 'hidden'
        })
        if (bar.current) bar.current.style.transform = `scaleX(${clamp01(t / duration).toFixed(4)})`
      },
    }),
    [],
  )

  return (
    <>
      <div className="flight-chapters" aria-hidden="true">
        {flightChapters.map((c, i) => (
          <div
            key={c.from}
            className="flight-chapter"
            ref={(el) => {
              chapters.current[i] = el
            }}
          >
            <p className="kicker">{c.kicker}</p>
            <p className="flight-chapter__lines">
              {c.lines.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </p>
          </div>
        ))}
      </div>
      <div className="flight-progress" aria-hidden="true">
        <div className="flight-progress__bar" ref={bar} />
      </div>
    </>
  )
}
