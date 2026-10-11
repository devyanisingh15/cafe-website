export const cafe = {
  name: 'Havana Café',
  shortName: 'Havana',
  place: 'Sissu, Lahaul',
  region: 'Himachal Pradesh',
  altitude: '3,100 m',
  tagline: ['A little place', 'above the clouds.'],
  currency: '₹',
  hours: 'Open daily · 8 am – 9 pm',
  address: 'Sissu, Lahaul & Spiti, Himachal Pradesh',
  mapsUrl: 'https://maps.google.com/?q=Havana+Cafe+Sissu',
  instagram: 'https://instagram.com/havana_cafe_sissu',
  instagramHandle: '@havana_cafe_sissu',
} as const

export const navLinks = [
  { label: 'Our Story', href: '/#story' },
  { label: 'The Space', href: '/#space' },
  { label: 'Menu', href: '/menu' },
  { label: 'Visit', href: '/#visit' },
  { label: 'Instagram', href: cafe.instagram, external: true },
] as const

/** Hero copy (placeholder — replace with the café's own words). */
export const hero = {
  headline: ['Where the horizon meets', 'timeless elegance'],
  support: 'Indulge in an unparalleled escape where sophisticated living meets the endless allure of nature.',
  cta: { label: 'Book a tour', href: '/#visit' },
} as const

export type Still =
  | 'interior-windows'
  | 'terrace'
  | 'terrace-table'
  | 'sign'
  | 'flags'
  | 'storefront'
  | 'games-room'
  | 'cafe-aerial'
  | 'cafe-village'
  | 'lake'
  | 'balcony'
  | 'waterfall'
  | 'clouds'

export const gallery: { still: Still; alt: string; caption: string }[] = [
  { still: 'terrace-table', alt: 'A carved wooden chair beside a blue velvet booth', caption: 'Carved chairs, blue booths' },
  { still: 'balcony', alt: 'Wooden tables on the deck outside the glass dining room', caption: 'Out on the deck' },
  { still: 'storefront', alt: 'The café front, teal glass and the yellow sign, at the end of the road', caption: 'Where the road ends' },
  { still: 'cafe-aerial', alt: 'The café from above with its blue roof and orange railings', caption: 'From the ridge' },
  { still: 'waterfall', alt: 'A waterfall dropping into the valley beside terraced fields', caption: 'The falls, across the valley' },
  { still: 'lake', alt: 'A still glacial lake beneath mountains', caption: 'A short drive away' },
]
