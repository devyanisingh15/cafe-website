import { useRef, useState } from 'react'
import { hero } from '../data/cafe'
import { useDroneFlight } from '../hooks/useDroneFlight'
import { prefersLightData, prefersReducedMotion } from '../lib/media'
import { HeroVideo, WIDE } from './HeroVideo'

/**
 * Full-screen cinematic hero. The background is a ~10 s drone approach at
 * golden hour — elevated establishing shot of the café among the village and
 * mountains, a slow push toward its glass front, through the door, and a
 * settle inside on the window wall. The camera move, motion blur, grade and
 * glow are baked into the film (scripts/build-media.sh); grain, vignette and
 * the readability gradient are light CSS layers on top. The headline never
 * moves; only the camera does.
 *
 * Layers, back to front: camera → shade (gradient, vignette, haze) → grain →
 * content. The navigation is fixed above all of it (MobileNavigation).
 * Wide screens get their own baked composition rather than a stretched crop.
 *
 * Reduced motion / Data Saver: no film; the settled final composition.
 */
export function MobileHero() {
  const [enabled] = useState(() => !(prefersReducedMotion() || prefersLightData()))
  const stageRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const { phase, toggle } = useDroneFlight({ videoRef, stageRef, enabled })
  const showToggle = enabled && phase !== 'arrived' && phase !== 'loading'

  return (
    <section className="hero" data-phase={phase} aria-labelledby="hero-title">
      <div className="hero__stage" ref={stageRef}>
        <div className="hero__camera" aria-hidden="true">
          <div className="hero__frame">
            {enabled && <HeroVideo ref={videoRef} visible={phase === 'playing' || phase === 'paused' || phase === 'arrived'} />}
            {/* The settled last frame: shown with reduced motion, and when returning to an already-played hero. */}
            <picture>
              <source media={WIDE} srcSet="/media/journey-wide-end.webp" width={1600} height={1000} />
              <img
                className="hero__end"
                src="/media/journey-end-800.webp"
                srcSet="/media/journey-end-400.webp 400w, /media/journey-end-800.webp 800w"
                sizes="100vw"
                alt=""
                width={756}
                height={936}
                decoding="async"
                fetchPriority={enabled ? 'low' : 'high'}
              />
            </picture>
          </div>
        </div>
        <div className="hero__shade" aria-hidden="true" />
        <div className="hero__grain" aria-hidden="true" />

        <div className="hero__content">
          <h1 id="hero-title" className="hero__title">
            {hero.headline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="hero__support">{hero.support}</p>
        </div>

        {showToggle && (
          <button
            type="button"
            className="hero__toggle"
            onClick={toggle}
            aria-label={phase === 'playing' ? 'Pause the background film' : 'Play the background film'}
          >
            <span className={phase === 'playing' ? 'icon-pause' : 'icon-play'} aria-hidden="true" />
          </button>
        )}
      </div>
    </section>
  )
}
