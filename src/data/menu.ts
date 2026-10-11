import type { ArtKind } from '../components/FoodArt'
import { menuPhotos } from './menu-photos'

export type CategoryId = 'coffee' | 'tea' | 'breakfast' | 'mains' | 'snacks' | 'desserts'

/** Indian menu convention: green dot veg, brown egg, red non-veg; vegan is veg with a V. */
export type Diet = 'veg' | 'vegan' | 'egg' | 'nonveg'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: CategoryId
  diet: Diet
  /** 0 none · 1 mild · 2 medium · 3 hot */
  spice?: 0 | 1 | 2 | 3
  /** Minutes from order to table. */
  prepMins: number
  tag?: string
  soldOut?: boolean
  /** Drawn fallback, used if the photo is missing. */
  art: { kind: ArtKind; tint?: string; bg: string }
  /** Photo base path: `${photo}-400.webp`, `${photo}-800.webp`. */
  photo?: string
}

export const categories: { id: CategoryId; label: string }[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'mains', label: 'Mains' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'desserts', label: 'Desserts' },
]

type Draft = Omit<MenuItem, 'photo'>

// Mock menu — names, prices and details are placeholders for the café's own.
const items: Draft[] = [
  // Coffee
  { id: 'cappuccino', name: 'Cappuccino', description: 'Double shot, silky steamed milk.', price: 180, category: 'coffee', diet: 'veg', prepMins: 5, tag: 'Most ordered', art: { kind: 'cup', tint: '#c89b6d', bg: '#d9cdb8' } },
  { id: 'latte', name: 'Café Latte', description: 'Mellow and milky, a little foam.', price: 190, category: 'coffee', diet: 'veg', prepMins: 5, art: { kind: 'cup', tint: '#d7b48b', bg: '#c7d0c8' } },
  { id: 'flat-white', name: 'Flat White', description: 'Ristretto shots, thin velvet milk.', price: 200, category: 'coffee', diet: 'veg', prepMins: 5, tag: 'New', art: { kind: 'cup', tint: '#b8875a', bg: '#d6cbbd' } },
  { id: 'americano', name: 'Americano', description: 'Espresso, hot water, nothing to hide.', price: 150, category: 'coffee', diet: 'vegan', prepMins: 4, art: { kind: 'cup-black', bg: '#e1c9a6' } },
  { id: 'mocha', name: 'Café Mocha', description: 'Espresso, dark chocolate, steamed milk.', price: 210, category: 'coffee', diet: 'veg', prepMins: 6, art: { kind: 'cup', tint: '#7a4a2e', bg: '#d4c3b6' } },
  { id: 'cold-coffee', name: 'Hazelnut Cold Coffee', description: 'Shaken over ice, hazelnut, cream.', price: 220, category: 'coffee', diet: 'veg', prepMins: 6, art: { kind: 'glass', tint: '#a8794f', bg: '#bfd0d6' } },
  { id: 'hot-chocolate', name: 'Hot Chocolate', description: 'Thick, dark, for after the snow.', price: 200, category: 'coffee', diet: 'veg', prepMins: 6, art: { kind: 'cup', tint: '#6b3f2a', bg: '#d8b9a6' } },

  // Tea
  { id: 'masala-chai', name: 'Masala Chai', description: 'Ginger, cardamom, boiled the slow way.', price: 90, category: 'tea', diet: 'veg', prepMins: 6, tag: 'Local favourite', art: { kind: 'chai', bg: '#e3cfa8' } },
  { id: 'seabuckthorn', name: 'Seabuckthorn Tea', description: 'Tart Lahauli berry, honey, warm water.', price: 130, category: 'tea', diet: 'veg', prepMins: 5, tag: 'Lahauli', art: { kind: 'teacup', tint: '#e48a2a', bg: '#cfd5c4' } },
  { id: 'kahwa', name: 'Saffron Kahwa', description: 'Green tea, saffron, almond slivers.', price: 140, category: 'tea', diet: 'vegan', prepMins: 6, art: { kind: 'teacup', tint: '#d9a53a', bg: '#d6c6d6' } },
  { id: 'butter-tea', name: 'Butter Tea', description: 'Salted, churned, the way it is made up here.', price: 120, category: 'tea', diet: 'veg', prepMins: 7, art: { kind: 'teacup', tint: '#e9d7b4', bg: '#c6cfd8' } },
  { id: 'kangra-green', name: 'Kangra Green Tea', description: 'Light, grassy leaf from the Kangra valley.', price: 120, category: 'tea', diet: 'vegan', prepMins: 4, art: { kind: 'teacup', tint: '#c9c76a', bg: '#d2d9c6' } },
  { id: 'lemon-ginger', name: 'Lemon Honey Ginger', description: 'For cold hands and long drives.', price: 110, category: 'tea', diet: 'veg', prepMins: 4, art: { kind: 'teacup', tint: '#f0cf5a', bg: '#d4dcc2' } },
  { id: 'iced-peach-tea', name: 'Iced Peach Tea', description: 'Black tea, peach, mint, lots of ice.', price: 160, category: 'tea', diet: 'vegan', prepMins: 4, art: { kind: 'glass', tint: '#e59a5c', bg: '#d9cbbd' } },

  // Breakfast
  { id: 'aloo-paratha', name: 'Aloo Paratha', description: 'Two parathas, white butter, curd, pickle.', price: 160, category: 'breakfast', diet: 'veg', spice: 1, prepMins: 15, art: { kind: 'paratha', bg: '#d9c9a9' } },
  { id: 'siddu', name: 'Siddu', description: 'Steamed Himachali bread, walnut filling, ghee.', price: 200, category: 'breakfast', diet: 'veg', prepMins: 20, tag: 'Himachali', art: { kind: 'siddu', bg: '#cbd3c6' } },
  { id: 'omelette', name: 'Masala Omelette', description: 'Three eggs, onion, chilli, buttered toast.', price: 150, category: 'breakfast', diet: 'egg', spice: 1, prepMins: 10, art: { kind: 'omelette', bg: '#e2d3b7' } },
  { id: 'mountain-breakfast', name: 'Mountain Breakfast', description: 'Two eggs any style, beans, hash brown, toast.', price: 320, category: 'breakfast', diet: 'egg', prepMins: 15, tag: 'Big plate', art: { kind: 'omelette', bg: '#d8ccb4' } },
  { id: 'pancakes', name: 'Pancake Stack', description: 'Buttermilk pancakes, honey, mountain berries.', price: 240, category: 'breakfast', diet: 'veg', prepMins: 12, art: { kind: 'pancakes', bg: '#d6c9d9' } },
  { id: 'porridge', name: 'Apple Cinnamon Porridge', description: 'Oats, oat milk, stewed apple, walnuts.', price: 180, category: 'breakfast', diet: 'vegan', prepMins: 8, art: { kind: 'crumble', bg: '#d4cdbd' } },
  { id: 'avocado-toast', name: 'Avocado Sourdough', description: 'Smashed avocado, chilli flakes, lemon.', price: 260, category: 'breakfast', diet: 'vegan', spice: 1, prepMins: 8, art: { kind: 'sandwich', bg: '#cbd6c4' } },

  // Mains
  { id: 'thukpa', name: 'Veg Thukpa', description: 'Tibetan noodle soup, vegetables, chilli oil.', price: 220, category: 'mains', diet: 'vegan', spice: 2, prepMins: 15, art: { kind: 'bowl', tint: '#d98b46', bg: '#c8d2cf' } },
  { id: 'thenthuk', name: 'Chicken Thenthuk', description: 'Hand-pulled noodles, chicken broth, greens.', price: 260, category: 'mains', diet: 'nonveg', spice: 2, prepMins: 18, art: { kind: 'bowl', tint: '#c9773c', bg: '#d3cbbf' } },
  { id: 'maggi', name: 'Mountain Maggi', description: 'Every hill café’s classic, done properly.', price: 130, category: 'mains', diet: 'veg', spice: 1, prepMins: 8, tag: 'Classic', art: { kind: 'bowl', tint: '#e8b341', bg: '#d8ccb4' } },
  { id: 'rajma-chawal', name: 'Rajma Chawal', description: 'Slow-cooked kidney beans, steamed rice.', price: 240, category: 'mains', diet: 'vegan', spice: 1, prepMins: 12, art: { kind: 'rice', bg: '#d2c3b0' } },
  { id: 'dham-thali', name: 'Himachali Dham Thali', description: 'Madra, rajma, kadhi, rice and meetha.', price: 340, category: 'mains', diet: 'veg', spice: 1, prepMins: 20, tag: 'Chef’s pick', art: { kind: 'rice', bg: '#d9cba9' } },
  { id: 'trout', name: 'Pan-fried Himalayan Trout', description: 'Local trout, lemon butter, herbed potatoes.', price: 420, category: 'mains', diet: 'nonveg', prepMins: 25, soldOut: true, art: { kind: 'omelette', bg: '#c9d3d6' } },
  { id: 'penne-arrabbiata', name: 'Penne Arrabbiata', description: 'Tomato, garlic, chilli, parmesan.', price: 280, category: 'mains', diet: 'veg', spice: 2, prepMins: 15, art: { kind: 'bowl', tint: '#c8432b', bg: '#ddcfc0' } },

  // Snacks
  { id: 'veg-momos', name: 'Veg Momos', description: 'Eight steamed dumplings, fiery red chutney.', price: 200, category: 'snacks', diet: 'vegan', spice: 2, prepMins: 15, art: { kind: 'momos', bg: '#cdd6cc' } },
  { id: 'chicken-momos', name: 'Chicken Momos', description: 'Juicy, steamed, with sesame-tomato achaar.', price: 220, category: 'snacks', diet: 'nonveg', spice: 2, prepMins: 15, tag: 'Bestseller', art: { kind: 'momos', bg: '#ddc9b3' } },
  { id: 'kothey', name: 'Kothey Momos', description: 'Pan-fried crisp on one side, soft on top.', price: 240, category: 'snacks', diet: 'veg', spice: 2, prepMins: 18, art: { kind: 'momos', bg: '#d6c4ad' } },
  { id: 'chilli-potato', name: 'Honey Chilli Potato', description: 'Crisp potato, honey, chilli, sesame.', price: 190, category: 'snacks', diet: 'vegan', spice: 3, prepMins: 12, art: { kind: 'fries', bg: '#d9c3b0' } },
  { id: 'pakora', name: 'Mixed Veg Pakora', description: 'Onion, potato and spinach fritters, mint chutney.', price: 150, category: 'snacks', diet: 'vegan', spice: 1, prepMins: 10, art: { kind: 'fries', bg: '#d6d0b3' } },
  { id: 'fries', name: 'Peri Peri Fries', description: 'Crisp, salted, dusted with peri peri.', price: 160, category: 'snacks', diet: 'vegan', spice: 2, prepMins: 10, art: { kind: 'fries', bg: '#c9cfd9' } },
  { id: 'grilled-cheese', name: 'Grilled Cheese', description: 'Sourdough, cheddar, a little chilli.', price: 180, category: 'snacks', diet: 'veg', prepMins: 8, art: { kind: 'sandwich', bg: '#dcd0b8' } },

  // Desserts
  { id: 'apple-crumble', name: 'Apple Crumble', description: 'Himachali apples, oat crumble, cream.', price: 220, category: 'desserts', diet: 'veg', prepMins: 10, tag: 'Seasonal', art: { kind: 'crumble', bg: '#d6c8b5' } },
  { id: 'brownie', name: 'Walnut Brownie', description: 'Fudgy, warm, local walnuts.', price: 180, category: 'desserts', diet: 'egg', prepMins: 5, art: { kind: 'brownie', bg: '#cfd4c9' } },
  { id: 'carrot-cake', name: 'Carrot Cake', description: 'Spiced sponge, cream cheese frosting.', price: 200, category: 'desserts', diet: 'egg', prepMins: 3, art: { kind: 'cake', bg: '#d9cbbf' } },
  { id: 'banoffee', name: 'Banoffee Pie', description: 'Toffee, banana, cream, biscuit base.', price: 230, category: 'desserts', diet: 'veg', prepMins: 3, art: { kind: 'cake', bg: '#dccdb4' } },
  { id: 'gulab-jamun', name: 'Warm Gulab Jamun', description: 'Two, in cardamom syrup, pistachio.', price: 140, category: 'desserts', diet: 'veg', prepMins: 5, art: { kind: 'crumble', bg: '#d8c2b4' } },
  { id: 'kulfi', name: 'Saffron Pista Kulfi', description: 'Slow-reduced milk, saffron, pistachio.', price: 150, category: 'desserts', diet: 'veg', prepMins: 3, art: { kind: 'cake', bg: '#e1d6b8' } },
]

const PHOTOS = new Set(menuPhotos)

export const menu: MenuItem[] = items.map((i) => (PHOTOS.has(i.id) ? { ...i, photo: `/media/menu/${i.id}` } : i))

export const menuById = new Map(menu.map((m) => [m.id, m]))

export const dietLabel: Record<Diet, string> = {
  veg: 'Vegetarian',
  vegan: 'Vegan',
  egg: 'Contains egg',
  nonveg: 'Non-vegetarian',
}
