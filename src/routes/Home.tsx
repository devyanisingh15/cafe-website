import { useRef } from 'react'
import { CafeGallery } from '../components/CafeGallery'
import { CafeStory } from '../components/CafeStory'
import { Footer } from '../components/Footer'
import { MobileHero, SKIP_FLIGHT_EVENT } from '../components/MobileHero'
import { MobileNavigation } from '../components/MobileNavigation'
import { useReveal } from '../hooks/useReveal'
import '../styles/home.css'

/** "/" — the discovery experience: fly in, land at a table, order. */
export default function Home() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  return (
    <div className="home" ref={root}>
      <button type="button" className="skip-link" onClick={() => window.dispatchEvent(new Event(SKIP_FLIGHT_EVENT))}>
        Skip the intro
      </button>
      <MobileNavigation />
      <main>
        <MobileHero />
        <CafeStory />
        <CafeGallery />
      </main>
      <Footer />
    </div>
  )
}
