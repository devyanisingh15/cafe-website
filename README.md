# Havana Café · Sissu

A mobile-first website for a small mountain café. It works in two modes:

- **`/` — the journey.** The guest scrolls and flies in: clouds, the Lahaul valley, the village, the blue roof, the front door, the sign, and inside to the window wall. Then *"You made it."* and the menu rises out of the page.
- **`/menu?table=07` — QR ordering.** No intro. The guest lands straight in a native-feeling ordering app for their table.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build into dist/
npm run preview    # serve dist/ on http://localhost:4173
```

## Routes

| URL | What it does |
| --- | --- |
| `/` | Cinematic journey → story → gallery → "Your table is ready" → visit |
| `/menu` | Ordering app. Asks the guest to pick a table. |
| `/menu?table=07` | Ordering app for table 07. This is the URL to print on each table's QR code. |

Each route is its own code-split chunk, so a QR scan never downloads the film or its scripts. A table number from the URL is remembered for the browser tab. A refresh or a visit to `/` keeps it. A table number that doesn't exist (for example `?table=99`) makes the app ask for the table instead of guessing.

The app is a single-page app. `public/_redirects` (Netlify) and `vercel.json` send deep links like `/menu?table=07` to `index.html`. Other hosts need the same rewrite.

## Where things live

```
src/
├── components/
│   ├── MobileHero.tsx           sticky scroll stage; reduced-motion fallback
│   ├── HeroVideo.tsx            poster → video, mobile/desktop + mp4/webm sources
│   ├── CinematicTransition.tsx  chapter lines, progress rail, end-of-flight veil
│   ├── MobileNavigation.tsx     transparent → floating pill; full-screen menu
│   ├── CafeStory.tsx / CafeGallery.tsx / MenuInvite.tsx / Footer.tsx
│   ├── Menu.tsx                 the ordering app (tabs, scroll-spy, flow)
│   ├── CategoryTabs.tsx  MenuCard.tsx  QtyControl.tsx  FoodArt.tsx
│   ├── FloatingCart.tsx  CartSheet.tsx  TablePicker.tsx  Sheet.tsx
│   └── OrderConfirmation.tsx
├── hooks/
│   ├── useScrollVideo.ts   scroll progress → video time (eased, seek-throttled)
│   ├── useCart.tsx         cart context, sessionStorage, screen-reader messages
│   ├── useTableNumber.ts   ?table= parsing/validation, table list
│   └── useReveal.ts        one IntersectionObserver for scroll reveals
├── data/
│   ├── cafe.ts   name, hours, links, journey chapters + keyframes, gallery
│   └── menu.ts   categories and items (placeholder prices)
├── lib/
│   ├── orders.ts  ← the one place to connect a real POS / kitchen backend
│   └── media.ts
└── routes/Home.tsx, routes/MenuPage.tsx
```

### Connecting a real backend

`src/lib/orders.ts` contains `submitOrder(order) → Promise<{ orderNumber, table, placedAt }>`. Right now it is a mock with a delay and a local counter. To go live, replace its body with a request to your POS or kitchen display. The UI only depends on the request and response types in that file. The table list is `TABLES` in `src/hooks/useTableNumber.ts`.

## Media pipeline

The supplied footage is three **Instagram Reels screen recordings** (576×1280). The status bar, captions, like/share icons and comment bar are burned into the pixels. `scripts/build-media.sh` cuts every asset from the clean window between them (504×624, x 0–504, y 360–984). It also builds the 12-shot journey edit with cross-fades, at the scene boundaries detected in the clips:

```bash
npm run media -- /path/to/folder/with/IMG_0053.MP4,IMG_0054.MP4,IMG_0055.MP4
```

| Output | Size | Notes |
| --- | --- | --- |
| `journey-mobile.mp4` | 2.4 MB | 504×624 H.264, 6-frame GOP for fast seeking |
| `journey-desktop.mp4` | 5.9 MB | 756×936, sharpened |
| `journey-*.webm` | 2.9 / 6.5 MB | VP9 for browsers without H.264 |
| `journey-poster.webp` | 15 KB | first frame, preloaded only on `/` |
| `<still>-{400,800,1200}.webp` | 13–138 KB | story / gallery stills, served via `srcset` |

If the shot list changes, update `journeyKeyframes` in `src/data/cafe.ts` too. It maps scroll progress to video time, so the café appears at about 30%, the exterior at about 70%, the entrance at about 85% and the inside at 100%.

**The single biggest upgrade is the original drone files.** The Reels crop is only 504 px wide. It looks fine on phones, but it is soft on large screens. That is why desktop shows the film in a portrait frame over an ambient wash instead of full-bleed. With raw footage, change `CROP` in the script and re-run it.

## Performance and loading

- Poster first: the hero `<img>` is the LCP element. The `<video>` uses `preload="metadata"` until the page has loaded and gone idle, or until the first scroll or touch. Then the whole file is fetched as a blob, so seeking never waits on the network.
- With Data Saver, 2G or `prefers-reduced-motion`, no video is downloaded. The journey becomes four still frames with simple fades.
- Fonts are self-hosted, Latin subset only. ₹ falls back to the system font, which saves an 85 KB download.
- The scroll loop runs only while the journey is on screen. It writes styles directly and never re-renders React.
- Gzipped JavaScript: about 103 KB shared, plus about 5 KB for each route chunk.

## Accessibility

Every control is at least 44 px. Focus states are visible. The cart, table picker and full-screen navigation are modal dialogs: focus moves in, is trapped, and returns to the control that opened them, and Escape closes them. Cart changes are announced through a polite live region ("Veg Momos added. 3 items in your order, ₹560."). The quantity buttons have item-specific labels, and the inactive half of the Add↔stepper control is `inert`. A "Skip the intro" link jumps past the journey.

## Placeholders to replace

- **Menu items and prices**: `src/data/menu.ts`.
- **Food images**: no food photos were supplied, so each dish is drawn as a top-down SVG illustration (`FoodArt.tsx`). To use a photo, add `photo: '/media/menu/<name>'` to an item and provide `<name>-400.webp` and `<name>-800.webp`. The card switches to the photo automatically.
- **Hours, address, altitude, Instagram**: `src/data/cafe.ts`.
