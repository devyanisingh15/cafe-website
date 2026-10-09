import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cafe } from '../data/cafe'
import { categories, menu } from '../data/menu'
import { useCart } from '../hooks/useCart'
import { useTableNumber } from '../hooks/useTableNumber'
import { submitOrder, type OrderLine, type OrderReceipt } from '../lib/orders'
import { prefersReducedMotion } from '../lib/media'
import { CartSheet } from './CartSheet'
import { CategoryTabs, type TabId } from './CategoryTabs'
import { FloatingCart } from './FloatingCart'
import { Logo } from './Logo'
import { MenuCard } from './MenuCard'
import { OrderConfirmation } from './OrderConfirmation'
import { TablePicker } from './TablePicker'

function greeting(d = new Date()) {
  const h = d.getHours()
  if (h < 12) return { text: 'Good morning', icon: '☕' }
  if (h < 17) return { text: 'Good afternoon', icon: '☀️' }
  return { text: 'Good evening', icon: '🌙' }
}

const byCategory = categories.map((c) => ({ ...c, items: menu.filter((m) => m.category === c.id) }))

/**
 * The ordering app. Reached from the story ("View Menu") or directly by QR
 * code at /menu?table=07 — in which case no intro plays at all.
 */
export function Menu() {
  const { table, setTable } = useTableNumber()
  const cart = useCart()
  const [active, setActive] = useState<TabId>('all')
  const [cartOpen, setCartOpen] = useState(false)
  const [tableOpen, setTableOpen] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState('')
  const [receipt, setReceipt] = useState<OrderReceipt | null>(null)
  const [receiptLines, setReceiptLines] = useState<OrderLine[]>([])
  const resumeOrder = useRef(false)
  const spyPaused = useRef(0)
  const hello = greeting()
  const closeReceipt = useCallback(() => setReceipt(null), [])

  // Scroll-spy: highlight the category currently under the sticky tabs.
  useEffect(() => {
    const sections = [...document.querySelectorAll<HTMLElement>('[data-category]')]
    const update = () => {
      if (performance.now() < spyPaused.current) return
      // The category occupying the upper third of the screen is the current one.
      const line = Math.max(140, window.innerHeight * 0.35)
      let current: TabId = 'all'
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s.dataset.category as TabId
      setActive(current)
    }
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  const selectTab = (id: TabId) => {
    setActive(id)
    spyPaused.current = performance.now() + 700 // don't flicker while smooth-scrolling
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth'
    if (id === 'all') {
      window.scrollTo({ top: 0, behavior })
      return
    }
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior, block: 'start' })
  }

  const place = useCallback(async () => {
    if (!table) {
      resumeOrder.current = true
      setTableOpen(true)
      return
    }
    setPlacing(true)
    setError(null)
    try {
      const r = await submitOrder({ table, lines: cart.lines, subtotal: cart.subtotal, note: note.trim() || undefined })
      setReceiptLines(cart.lines)
      setReceipt(r)
      setCartOpen(false)
      cart.clear()
      setNote('')
    } catch {
      setError('We couldn’t send that. Please try again, or wave at us.')
    } finally {
      setPlacing(false)
    }
  }, [table, cart, note])

  const pickTable = (t: string) => {
    setTable(t)
    setTableOpen(false)
    if (resumeOrder.current) {
      resumeOrder.current = false
      setCartOpen(true)
    }
  }

  const changeTable = () => {
    resumeOrder.current = cartOpen
    setCartOpen(false)
    setTableOpen(true)
  }

  const overlay = cartOpen || tableOpen || !!receipt

  return (
    <div className="menu-app">
      <div className="menu-app__content" inert={overlay}>
        <header className="menu-top">
          <Link to="/" className="menu-top__logo" aria-label={`${cafe.name} — see the café`}>
            <Logo />
          </Link>
          {table ? (
            <button type="button" className="table-chip" onClick={() => setTableOpen(true)} aria-label={`Table ${table}. Change table`}>
              <span className="table-chip__dot" aria-hidden="true" />
              Table {table}
            </button>
          ) : (
            <button type="button" className="table-chip table-chip--empty" onClick={() => setTableOpen(true)}>
              Select your table
            </button>
          )}
        </header>

        <main id="main" className="menu-main">
          <section className="menu-hello" aria-labelledby="menu-title">
            <p className="menu-hello__greet">
              {hello.text} <span aria-hidden="true">{hello.icon}</span>
            </p>
            <p className="menu-hello__table">
              {table ? (
                <>TABLE {table}</>
              ) : (
                <button type="button" className="link-btn link-btn--strong" onClick={() => setTableOpen(true)}>
                  Select your table
                </button>
              )}
            </p>
            <h1 id="menu-title" className="display display--md">
              What would you like?
            </h1>
          </section>

          <CategoryTabs active={active} onSelect={selectTab} />

          {byCategory.map((c, ci) => (
            <section key={c.id} id={`cat-${c.id}`} data-category={c.id} className="menu-cat" aria-labelledby={`cat-title-${c.id}`}>
              <h2 id={`cat-title-${c.id}`} className="menu-cat__title">
                {c.label}
                <span className="menu-cat__count">{c.items.length}</span>
              </h2>
              <div className="menu-grid">
                {c.items.map((item, i) => (
                  <MenuCard key={item.id} item={item} eager={ci === 0 && i < 2} />
                ))}
              </div>
            </section>
          ))}

          <p className="menu-foot">
            Prices in ₹. Tell us about allergies in your order note.
            <br />
            {cafe.name} · {cafe.place}
          </p>
        </main>
      </div>

      <FloatingCart onOpen={() => setCartOpen(true)} hidden={overlay} />

      <CartSheet
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        table={table}
        onChangeTable={changeTable}
        onPlace={place}
        placing={placing}
        error={error}
        note={note}
        onNote={setNote}
      />
      <TablePicker
        open={tableOpen}
        current={table}
        onClose={() => {
          resumeOrder.current = false
          setTableOpen(false)
        }}
        onPick={pickTable}
      />
      <OrderConfirmation receipt={receipt} lines={receiptLines} onDone={closeReceipt} />

      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {cart.announcement}
      </p>
    </div>
  )
}
