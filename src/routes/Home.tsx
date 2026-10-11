import { useRef } from 'react'
import { CafeGallery } from '../components/CafeGallery'
import { CafeStory } from '../components/CafeStory'
import { Footer } from '../components/Footer'
import { MobileHero } from '../components/MobileHero'
import { MobileNavigation } from '../components/MobileNavigation'
import { useReveal } from '../hooks/useReveal'
import '../styles/home.css'

/** "/" — the discovery experience: the cinematic approach, then the café. */
export default function Home() {
  const root = useRef<HTMLDivElement>(null)
  useReveal(root)
  return (
    <div className="home" ref={root}>
      <a className="skip-link" href="#story">
        Skip to content
      </a>
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
