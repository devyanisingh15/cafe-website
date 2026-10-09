import { useEffect, useRef } from 'react'
import { categories, type CategoryId } from '../data/menu'

export type TabId = 'all' | CategoryId

const TABS: { id: TabId; label: string }[] = [{ id: 'all', label: 'All' }, ...categories]

/**
 * Sticky, horizontally scrollable categories. Tapping one scrolls the menu to
 * it; scrolling the menu moves the highlight (scroll-spy lives in Menu).
 */
export function CategoryTabs({ active, onSelect }: { active: TabId; onSelect: (id: TabId) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)

  // Keep the active tab in view inside the strip.
  useEffect(() => {
    const track = trackRef.current
    const btn = track?.querySelector<HTMLElement>(`[data-tab="${active}"]`)
    if (!track || !btn) return
    const left = btn.offsetLeft - (track.clientWidth - btn.offsetWidth) / 2
    track.scrollTo({ left, behavior: 'smooth' })
  }, [active])

  return (
    <nav className="tabs" aria-label="Menu categories">
      <div className="tabs__track" ref={trackRef}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            data-tab={t.id}
            className="tabs__tab"
            aria-current={active === t.id ? 'true' : undefined}
            onClick={() => onSelect(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
