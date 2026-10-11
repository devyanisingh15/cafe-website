import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cafe, hero, navLinks } from '../data/cafe'
import { Logo } from './Logo'

/**
 * Fixed above the hero film: brand left, links centre, primary CTA right.
 * Transparent over the hero, a compact floating pill once you scroll on.
 * On phones ☰ opens a full-screen menu and the brand sits centre.
 */
export function MobileNavigation() {
  const [compact, setCompact] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > window.innerHeight * 0.12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const root = document.documentElement
    root.classList.add('scroll-locked')
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'Tab' && panelRef.current) {
        // Keep focus inside the open menu.
        const f = panelRef.current.querySelectorAll<HTMLElement>('a, button')
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      root.classList.remove('scroll-locked')
      document.removeEventListener('keydown', onKey)
      toggleRef.current?.focus({ preventScroll: true })
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <>
      <header className="site-nav" data-compact={compact || undefined}>
        <div className="site-nav__bar">
          <button
            ref={toggleRef}
            type="button"
            className="icon-btn site-nav__toggle"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(true)}
          >
            <span className="burger" aria-hidden="true" />
          </button>
          <Link to="/" className="site-nav__logo" aria-label={`${cafe.name}, home`} onClick={() => window.scrollTo({ top: 0 })}>
            <Logo />
          </Link>
          <nav className="site-nav__links" aria-label="Primary">
            {navLinks.map((l) =>
              'external' in l ? (
                <a key={l.label} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ) : l.href === '/menu' ? (
                <Link key={l.label} to="/menu" viewTransition>
                  {l.label}
                </Link>
              ) : (
                <a key={l.label} href={l.href.replace('/', '')}>
                  {l.label}
                </a>
              ),
            )}
          </nav>
          <a href={hero.cta.href.replace('/', '')} className="site-nav__cta">
            {hero.cta.label}
            <span className="site-nav__cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </header>

      <div
        id="site-menu"
        ref={panelRef}
        className="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        data-open={open || undefined}
        inert={!open}
      >
        <button type="button" className="icon-btn site-menu__close" aria-label="Close menu" onClick={close}>
          <span className="close-x" aria-hidden="true" />
        </button>
        <nav aria-label="Site">
          <ol className="site-menu__list">
            {navLinks.map((l, i) => (
              <li key={l.label} style={{ '--i': i } as React.CSSProperties}>
                {'external' in l ? (
                  <a href={l.href} target="_blank" rel="noreferrer" onClick={close}>
                    {l.label}
                    <span className="site-menu__ext" aria-hidden="true">↗</span>
                  </a>
                ) : l.href === '/menu' ? (
                  <Link to="/menu" viewTransition onClick={close}>
                    {l.label}
                  </Link>
                ) : (
                  <a href={l.href.replace('/', '')} onClick={close}>
                    {l.label}
                  </a>
                )}
              </li>
            ))}
          </ol>
        </nav>
        <p className="site-menu__foot">
          {cafe.place} · {cafe.hours}
        </p>
      </div>
    </>
  )
}
