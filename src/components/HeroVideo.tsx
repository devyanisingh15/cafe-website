import type { Ref } from 'react'
import { journeySources } from '../lib/media'

const MP4 = 'video/mp4; codecs="avc1.64001F"' // H.264 High@3.1
const WEBM = 'video/webm; codecs="vp9"'

interface Props {
  ref?: Ref<HTMLVideoElement>
  /** Show the video layer (it has frames to show). */
  visible: boolean
}

/**
 * Poster first, film second. The poster <img> — the film's first frame — is
 * the LCP element and paints immediately. The <video> downloads nothing by
 * itself (preload="none"); useDroneFlight fetches the right <source> and
 * starts it, and it fades in over the identical poster frame.
 * Phones and tablets get the 504-px mobile cut, desktop the sharper one;
 * H.264 first, VP9 for browsers built without it.
 */
export function HeroVideo({ ref, visible }: Props) {
  return (
    <div className="hero-video" data-ready={visible || undefined}>
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
        preload="none"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      >
        {/* Codec strings matter: without them a browser lacking H.264 still says
            "maybe" to plain video/mp4 and picks a file it cannot decode. */}
        <source media="(max-width: 768px)" src={journeySources.mobile} type={MP4} />
        <source media="(max-width: 768px)" src={journeySources.mobileWebm} type={WEBM} />
        <source src={journeySources.desktop} type={MP4} />
        <source src={journeySources.desktopWebm} type={WEBM} />
      </video>
    </div>
  )
}
