import { useEffect } from 'react'
import { Menu } from '../components/Menu'
import '../styles/menu.css'

/** "/menu" and "/menu?table=07" — straight to ordering, no intro. */
export default function MenuPage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Menu · Havana Café, Sissu'
    const meta = document.querySelector('meta[name="theme-color"]')
    const prevColor = meta?.getAttribute('content')
    meta?.setAttribute('content', '#f3eee5')
    return () => {
      document.title = prev
      if (prevColor) meta?.setAttribute('content', prevColor)
    }
  }, [])
  return <Menu />
}
