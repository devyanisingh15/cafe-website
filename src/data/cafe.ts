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
 * Words over the flight. `at` is the scroll progress (0–1) through the
 * journey where each line is fully visible; it fades in and out around it.
 */
export const journeyChapters = [
  { at: 0.2, kicker: 'Lahaul valley', lines: ['The road climbs', 'past 3,100 metres.'] },
  { at: 0.39, kicker: 'Sissu', lines: ['There —', 'the blue roof.'] },
  { at: 0.62, kicker: 'Arrival', lines: ['The road ends', 'at our door.'] },
  { at: 0.76, kicker: 'Come in', lines: ['Mind the', 'prayer flags.'] },
] as const

/**
 * Maps scroll progress to a time in the journey edit (seconds), so each beat
 * of the story lands where it should: café visible ~30%, exterior ~70%,
 * entrance ~85%, inside at 100%. The first 1.8 s (clouds) plays by itself on
 * load. Must stay in sync with SHOTS in scripts/build-media.sh.
 */
export const journeyKeyframes: ReadonlyArray<readonly [progress: number, time: number]> = [
  [0, 1.8],
  [0.15, 4.2],
  [0.3, 6.2],
  [0.5, 8.1],
  [0.7, 9.6],
  [0.85, 11.3],
  [1, 17.7],
]
export const journeyIdleEnd = 1.8

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
