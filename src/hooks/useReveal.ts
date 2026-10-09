import { useEffect, type RefObject } from 'react'

/**
 * Adds `is-in` to every [data-reveal] element inside `root` the first time it
 * scrolls into view. One observer per page; CSS does the animating.
 */
export function useReveal(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current
    if (!el) return
    const targets = el.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      targets.forEach((t) => t.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.01 },
    )
    targets.forEach((t) => io.observe(t))
    return () => io.disconnect()
  }, [root])
}
