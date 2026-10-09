import type { Ref } from 'react'
import { journeySources } from '../lib/media'

interface Props {
  ref?: Ref<HTMLVideoElement>
  ready: boolean
}

/**
 * Poster first, video second. The poster <img> is the LCP element and paints
 * immediately; the <video> only fetches metadata until useScrollVideo pulls
 * the full file in, then fades in over the poster on its first frame.
 * Phones and tablets get the 504-px mobile cut, desktop the sharpened one;
 * H.264 first, VP9 for browsers built without it.
 */
export function HeroVideo({ ref, ready }: Props) {
  return (
    <div className="hero-video" data-ready={ready || undefined}>
      <img
        className="hero-video__poster"
        src={journeySources.poster}
        alt=""
        width={504}
        height={624}
        fetchPriority="high"
        decoding="async"
      />
      <video
        ref={ref}
        className="hero-video__el"
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      >
        <source media="(max-width: 768px)" src={journeySources.mobile} type="video/mp4" />
        <source media="(max-width: 768px)" src={journeySources.mobileWebm} type="video/webm" />
        <source src={journeySources.desktop} type="video/mp4" />
        <source src={journeySources.desktopWebm} type="video/webm" />
      </video>
    </div>
  )
}
