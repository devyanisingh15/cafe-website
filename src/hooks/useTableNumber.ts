import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Tables that exist in the café. Kept here so a backend can replace it. */
export const TABLES = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'))

const STORAGE_KEY = 'havana:table'

/** "7", "07", "T7", "table-07" → "07"; anything not in TABLES → null. */
export function normaliseTable(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null
  const t = String(Number(digits)).padStart(2, '0')
  return TABLES.includes(t) ? t : null
}

function readStored() {
  try {
    return normaliseTable(sessionStorage.getItem(STORAGE_KEY))
  } catch {
    return null
  }
}

/**
 * Reads the table from `?table=07` (what the QR code encodes). Falls back to
 * the table chosen earlier in this tab, so a refresh or a detour to the home
 * page doesn't lose it. Choosing a table writes it back to the URL.
 */
export function useTableNumber() {
  const [params, setParams] = useSearchParams()
  const fromUrl = normaliseTable(params.get('table'))
  // A table in the URL that doesn't exist means "ask", never "guess".
  const hasParam = params.has('table')
  const table = useMemo(() => fromUrl ?? (hasParam ? null : readStored()), [fromUrl, hasParam])

  if (fromUrl) {
    try {
      sessionStorage.setItem(STORAGE_KEY, fromUrl)
    } catch {
      /* ignore */
    }
  }

  const setTable = useCallback(
    (t: string) => {
      const n = normaliseTable(t)
      if (!n) return
      try {
        sessionStorage.setItem(STORAGE_KEY, n)
      } catch {
        /* ignore */
      }
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          next.set('table', n)
          return next
        },
        { replace: true },
      )
    },
    [setParams],
  )

  return { table, fromQr: !!fromUrl, setTable }
}
