import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  /** Header area; dragging it down closes the sheet on phones. */
  header: ReactNode
  footer?: ReactNode
  className?: string
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * A bottom sheet on phones (slides up, drag the header down to dismiss) and
 * a right-hand drawer from 1024 px. Modal: focus is moved in, trapped, and
 * returned to whatever opened it; Escape and the backdrop close it.
 */
export function Sheet({ open, onClose, labelledBy, children, header, footer, className = '' }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current!
    const opener = document.activeElement as HTMLElement | null
    document.documentElement.classList.add('scroll-locked')
    // Wait a frame so the panel is no longer inert before focusing it.
    const raf = requestAnimationFrame(() => panel.focus({ preventScroll: true }))

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onCloseRef.current()
      } else if (e.key === 'Tab') {
        const f = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)]
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
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
      cancelAnimationFrame(raf)
      document.removeEventListener('keydown', onKey)
      document.documentElement.classList.remove('scroll-locked')
      if (opener?.isConnected) opener.focus({ preventScroll: true })
    }
  }, [open])

  // Drag-to-close, phones only, from the header so it never fights list scrolling.
  const drag = useRef<{ y: number; t: number; dy: number; id: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    if (window.matchMedia('(min-width: 1024px)').matches) return
    if ((e.target as HTMLElement).closest('button, a, input, textarea')) return
    drag.current = { y: e.clientY, t: performance.now(), dy: 0, id: e.pointerId }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    panelRef.current!.style.transition = 'none'
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const raw = e.clientY - d.y
    d.dy = raw > 0 ? raw : raw * 0.15 // resist upward pulls
    panelRef.current!.style.transform = `translate3d(0, ${d.dy}px, 0)`
  }
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    const panel = panelRef.current!
    const velocity = d.dy / Math.max(1, performance.now() - d.t)
    panel.style.transition = ''
    panel.style.transform = ''
    if (d.dy > Math.min(140, panel.offsetHeight * 0.3) || (d.dy > 24 && velocity > 0.6)) onCloseRef.current()
  }

  return (
    <div className={`sheet ${className}`} data-open={open || undefined} inert={!open}>
      <div className="sheet__backdrop" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        className="sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
      >
        <div
          className="sheet__head"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <span className="sheet__grab" aria-hidden="true" />
          {header}
        </div>
        <div className="sheet__body">{children}</div>
        {footer && <div className="sheet__foot">{footer}</div>}
      </div>
    </div>
  )
}
