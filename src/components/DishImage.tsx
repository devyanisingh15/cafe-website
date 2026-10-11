import type { MenuItem } from '../data/menu'
import { FoodArt } from './FoodArt'

interface Props {
  item: MenuItem
  /** `sizes` for the photo's srcset. */
  sizes: string
  eager?: boolean
  /** Thumbnails next to the dish name don't need their own description. */
  decorative?: boolean
}

/** The dish's photo when it has one, otherwise its drawn plate. */
export function DishImage({ item, sizes, eager = false, decorative = false }: Props) {
  if (!item.photo) {
    return <FoodArt kind={item.art.kind} bg={item.art.bg} tint={item.art.tint} label={decorative ? '' : item.name} />
  }
  return (
    <img
      className="dish-img"
      src={`${item.photo}-800.webp`}
      srcSet={`${item.photo}-400.webp 400w, ${item.photo}-800.webp 800w`}
      sizes={sizes}
      alt={decorative ? '' : item.name}
      width={800}
      height={500}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      style={{ backgroundColor: item.art.bg }}
    />
  )
}
