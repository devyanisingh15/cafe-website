import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { menuById } from '../data/menu'
import type { OrderLine } from '../lib/orders'

type Quantities = Record<string, number>
type Action = { type: 'add' | 'remove'; id: string } | { type: 'clear' }

const STORAGE_KEY = 'havana:cart'

function reducer(state: Quantities, action: Action): Quantities {
  switch (action.type) {
    case 'add':
      return { ...state, [action.id]: (state[action.id] ?? 0) + 1 }
    case 'remove': {
      const q = (state[action.id] ?? 0) - 1
      const next = { ...state }
      if (q > 0) next[action.id] = q
      else delete next[action.id]
      return next
    }
    case 'clear':
      return {}
  }
}

function load(): Quantities {
  try {
    const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}') as Quantities
    return Object.fromEntries(Object.entries(raw).filter(([id, q]) => menuById.has(id) && !menuById.get(id)!.soldOut && q > 0))
  } catch {
    return {}
  }
}

interface CartValue {
  quantities: Quantities
  lines: OrderLine[]
  count: number
  subtotal: number
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  /** Last change, phrased for screen readers. */
  announcement: string
}

const CartContext = createContext<CartValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [quantities, dispatch] = useReducer(reducer, undefined, load)
  const [announcement, setAnnouncement] = useState('')
  const pending = useRef('')

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(quantities))
    } catch {
      /* ignore */
    }
  }, [quantities])

  const lines = useMemo<OrderLine[]>(
    () =>
      Object.entries(quantities).map(([id, qty]) => {
        const item = menuById.get(id)!
        return { id, name: item.name, price: item.price, qty }
      }),
    [quantities],
  )
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0)

  useEffect(() => {
    if (!pending.current) return
    setAnnouncement(`${pending.current} ${count} ${count === 1 ? 'item' : 'items'} in your order, ₹${subtotal}.`)
    pending.current = ''
  }, [count, subtotal])

  const add = useCallback((id: string) => {
    pending.current = `${menuById.get(id)?.name} added.`
    dispatch({ type: 'add', id })
  }, [])
  const remove = useCallback((id: string) => {
    pending.current = `${menuById.get(id)?.name} removed.`
    dispatch({ type: 'remove', id })
  }, [])
  const clear = useCallback(() => dispatch({ type: 'clear' }), [])

  const value = useMemo(
    () => ({ quantities, lines, count, subtotal, add, remove, clear, announcement }),
    [quantities, lines, count, subtotal, add, remove, clear, announcement],
  )
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}
