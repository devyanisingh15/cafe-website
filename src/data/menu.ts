import type { ArtKind } from '../components/FoodArt'

export type CategoryId = 'coffee' | 'tea' | 'breakfast' | 'mains' | 'snacks' | 'desserts'

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: CategoryId
  veg: boolean
  /** Illustration used until real photography is added. */
  art: { kind: ArtKind; tint?: string; bg: string }
  /** Optional photo base path, e.g. '/media/menu/cappuccino' → -400/-800 .webp */
  photo?: string
  tag?: string
}

export const categories: { id: CategoryId; label: string }[] = [
  { id: 'coffee', label: 'Coffee' },
  { id: 'tea', label: 'Tea' },
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'mains', label: 'Mains' },
  { id: 'snacks', label: 'Snacks' },
  { id: 'desserts', label: 'Desserts' },
]

// Placeholder menu and prices — replace with the café's real menu.
export const menu: MenuItem[] = [
  // Coffee
  { id: 'cappuccino', name: 'Cappuccino', description: 'Double shot, silky steamed milk.', price: 180, category: 'coffee', veg: true, tag: 'Most ordered', art: { kind: 'cup', tint: '#c89b6d', bg: '#d9cdb8' } },
  { id: 'latte', name: 'Café Latte', description: 'Mellow and milky, a little foam.', price: 190, category: 'coffee', veg: true, art: { kind: 'cup', tint: '#d7b48b', bg: '#c7d0c8' } },
  { id: 'americano', name: 'Americano', description: 'Espresso, hot water, nothing to hide.', price: 150, category: 'coffee', veg: true, art: { kind: 'cup-black', bg: '#e1c9a6' } },
  { id: 'cold-coffee', name: 'Hazelnut Cold Coffee', description: 'Shaken over ice, hazelnut, cream.', price: 220, category: 'coffee', veg: true, art: { kind: 'glass', tint: '#a8794f', bg: '#bfd0d6' } },
  { id: 'hot-chocolate', name: 'Hot Chocolate', description: 'Thick, dark, for after the snow.', price: 200, category: 'coffee', veg: true, art: { kind: 'cup', tint: '#6b3f2a', bg: '#d8b9a6' } },

  // Tea
  { id: 'masala-chai', name: 'Masala Chai', description: 'Ginger, cardamom, boiled the slow way.', price: 90, category: 'tea', veg: true, tag: 'Local favourite', art: { kind: 'chai', bg: '#e3cfa8' } },
  { id: 'seabuckthorn', name: 'Seabuckthorn Tea', description: 'Tart Lahauli berry, honey, warm water.', price: 130, category: 'tea', veg: true, art: { kind: 'teacup', tint: '#e48a2a', bg: '#cfd5c4' } },
  { id: 'kahwa', name: 'Saffron Kahwa', description: 'Green tea, saffron, almond slivers.', price: 140, category: 'tea', veg: true, art: { kind: 'teacup', tint: '#d9a53a', bg: '#d6c6d6' } },
  { id: 'butter-tea', name: 'Butter Tea', description: 'Salted, churned, the way it is made up here.', price: 120, category: 'tea', veg: true, art: { kind: 'teacup', tint: '#e9d7b4', bg: '#c6cfd8' } },
  { id: 'lemon-ginger', name: 'Lemon Honey Ginger', description: 'For cold hands and long drives.', price: 110, category: 'tea', veg: true, art: { kind: 'teacup', tint: '#f0cf5a', bg: '#d4dcc2' } },

  // Breakfast
  { id: 'aloo-paratha', name: 'Aloo Paratha', description: 'Two parathas, white butter, curd, pickle.', price: 160, category: 'breakfast', veg: true, art: { kind: 'paratha', bg: '#d9c9a9' } },
  { id: 'siddu', name: 'Siddu', description: 'Steamed Himachali bread, walnut filling, ghee.', price: 200, category: 'breakfast', veg: true, tag: 'Himachali', art: { kind: 'siddu', bg: '#cbd3c6' } },
  { id: 'omelette', name: 'Masala Omelette', description: 'Three eggs, onion, chilli, buttered toast.', price: 150, category: 'breakfast', veg: false, art: { kind: 'omelette', bg: '#e2d3b7' } },
  { id: 'pancakes', name: 'Pancake Stack', description: 'Buttermilk pancakes, honey, mountain berries.', price: 240, category: 'breakfast', veg: true, art: { kind: 'pancakes', bg: '#d6c9d9' } },

  // Mains
  { id: 'thukpa', name: 'Thukpa', description: 'Tibetan noodle soup, vegetables, chilli oil.', price: 220, category: 'mains', veg: true, art: { kind: 'bowl', tint: '#d98b46', bg: '#c8d2cf' } },
  { id: 'maggi', name: 'Mountain Maggi', description: 'Every hill café’s classic, done properly.', price: 130, category: 'mains', veg: true, tag: 'Classic', art: { kind: 'bowl', tint: '#e8b341', bg: '#d8ccb4' } },
  { id: 'rajma-chawal', name: 'Rajma Chawal', description: 'Slow-cooked kidney beans, steamed rice.', price: 240, category: 'mains', veg: true, art: { kind: 'rice', bg: '#d2c3b0' } },

  // Snacks
  { id: 'veg-momos', name: 'Veg Momos', description: 'Eight steamed dumplings, fiery red chutney.', price: 200, category: 'snacks', veg: true, art: { kind: 'momos', bg: '#cdd6cc' } },
  { id: 'chicken-momos', name: 'Chicken Momos', description: 'Juicy, steamed, with sesame-tomato achaar.', price: 220, category: 'snacks', veg: false, art: { kind: 'momos', bg: '#ddc9b3' } },
  { id: 'fries', name: 'Peri Peri Fries', description: 'Crisp, salted, dusted with peri peri.', price: 160, category: 'snacks', veg: true, art: { kind: 'fries', bg: '#c9cfd9' } },
  { id: 'grilled-cheese', name: 'Grilled Cheese', description: 'Sourdough, cheddar, a little chilli.', price: 180, category: 'snacks', veg: true, art: { kind: 'sandwich', bg: '#dcd0b8' } },

  // Desserts
  { id: 'apple-crumble', name: 'Apple Crumble', description: 'Himachali apples, oat crumble, cream.', price: 220, category: 'desserts', veg: true, tag: 'Seasonal', art: { kind: 'crumble', bg: '#d6c8b5' } },
  { id: 'brownie', name: 'Walnut Brownie', description: 'Fudgy, warm, local walnuts.', price: 180, category: 'desserts', veg: true, art: { kind: 'brownie', bg: '#cfd4c9' } },
  { id: 'carrot-cake', name: 'Carrot Cake', description: 'Spiced sponge, cream cheese frosting.', price: 200, category: 'desserts', veg: true, art: { kind: 'cake', bg: '#d9cbbf' } },
]

export const menuById = new Map(menu.map((m) => [m.id, m]))
