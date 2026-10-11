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

/**
 * Words over the flight, timed to the film (seconds). Each line is fully
 * visible from `from` to `to` and fades in and out around that window.
 * Shot starts (printed by scripts/build-media.sh): mountains 0, valley 1.2,
 * village 1.9, blue roof 2.7, approach 4.2, front door 6.3, sign 7.3,
 * inside 8.1, window wall 10.3; the camera settles by ~14 s.
 */
export const flightTitleOut = 2.6 // the opening title leaves as the camera dives
export const flightChapters = [
  { from: 3.0, to: 4.1, kicker: 'Sissu, Lahaul', lines: ['There —', 'the blue roof.'] },
  { from: 6.5, to: 7.4, kicker: 'Arrival', lines: ['The road ends', 'at our door.'] },
  { from: 8.6, to: 9.8, kicker: 'Come in', lines: ['Mind the', 'prayer flags.'] },
] as const

/** Dishes shown in the menu that rises when the flight lands. */
export const arrivalPicks = ['cappuccino', 'masala-chai', 'veg-momos'] as const

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
