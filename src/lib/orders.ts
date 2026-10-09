/**
 * The single seam between the menu UI and a real restaurant backend.
 * Swap `submitOrder` for a POST to your POS / kitchen display; the UI only
 * depends on the shapes below.
 */
export interface OrderLine {
  id: string
  name: string
  price: number
  qty: number
}

export interface OrderRequest {
  table: string
  lines: OrderLine[]
  subtotal: number
  note?: string
}

export interface OrderReceipt {
  orderNumber: number
  table: string
  placedAt: string
}

const COUNTER_KEY = 'havana:order-counter'

export async function submitOrder(order: OrderRequest): Promise<OrderReceipt> {
  if (!order.table) throw new Error('A table is required')
  if (order.lines.length === 0) throw new Error('The order is empty')

  // Demo: simulate network latency and a running order counter.
  await new Promise((r) => setTimeout(r, 700))
  let n = 103
  try {
    n = Number(localStorage.getItem(COUNTER_KEY)) || 103
    localStorage.setItem(COUNTER_KEY, String(n + 1))
  } catch {
    /* storage unavailable — fall back to the default counter */
  }
  return { orderNumber: n + 1, table: order.table, placedAt: new Date().toISOString() }
}
