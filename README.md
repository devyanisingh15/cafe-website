# Havana Café · Sissu

A mobile-first website for a small mountain café. It works in two modes:

- **`/` — the flight in.** A 15-second drone film plays by itself as the page loads: over the mountains, down to the village, at the café's glass front, through the door, then a slow tilt down to the window wall, where the camera settles. Only then does the menu rise into the frame.
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
| `/` | Drone flight → lands on the menu → story → gallery → visit |
| `/menu` | Ordering app. Asks the guest to pick a table. |
| `/menu?table=07` | Ordering app for table 07. This is the URL to print on each table's QR code. |

Each route is its own code-split chunk, so a QR scan never downloads the film or its scripts. A table number from the URL is remembered for the browser tab. A refresh or a visit to `/` keeps it. A table number that doesn't exist (for example `?table=99`) makes the app ask for the table instead of guessing.

The app is a single-page app. `public/_redirects` (Netlify) and `vercel.json` send deep links like `/menu?table=07` to `index.html`. Other hosts need the same rewrite.

## Where things live

```
src/
├── components/
│   ├── MobileHero.tsx           the flight stage: film, title, skip, landing
│   ├── HeroVideo.tsx            poster → film, mobile/desktop + mp4/webm sources
│   ├── CinematicTransition.tsx  chapter lines + progress, timed to the film
│   ├── HeroMenu.tsx             the menu that rises once the camera settles
│   ├── MobileNavigation.tsx     transparent → floating pill; full-screen menu
│   ├── CafeStory.tsx / CafeGallery.tsx / Footer.tsx
│   ├── Menu.tsx                 the ordering app (tabs, scroll-spy, flow)
│   ├── CategoryTabs.tsx  MenuCard.tsx  QtyControl.tsx  FoodArt.tsx
│   ├── FloatingCart.tsx  CartSheet.tsx  TablePicker.tsx  Sheet.tsx
│   └── OrderConfirmation.tsx
├── hooks/
│   ├── useDroneFlight.ts   loads + autoplays the film; loading/blocked/playing/arrived
│   ├── useCart.tsx         cart context, sessionStorage, screen-reader messages
│   ├── useTableNumber.ts   ?table= parsing/validation, table list
│   └── useReveal.ts        one IntersectionObserver for scroll reveals
├── data/
│   ├── cafe.ts   name, hours, links, flight chapter timings, gallery
│   └── menu.ts   categories and items (placeholder prices)
├── lib/
│   ├── orders.ts  ← the one place to connect a real POS / kitchen backend
│   └── media.ts
└── routes/Home.tsx, routes/MenuPage.tsx
```

### Connecting a real backend

`src/lib/orders.ts` contains `submitOrder(order) → Promise<{ orderNumber, table, placedAt }>`. Right now it is a mock with a delay and a local counter. To go live, replace its body with a request to your POS or kitchen display. The UI only depends on the request and response types in that file. The table list is `TABLES` in `src/hooks/useTableNumber.ts`.

## Media pipeline

The supplied footage is three **Instagram Reels screen recordings** (576×1280). The status bar, captions, like/share icons and comment bar are burned into the pixels. `scripts/build-media.sh` cuts every asset from the clean window between them (504×624, x 0–504, y 360–984).

```bash
npm run media -- /path/to/folder/with/IMG_0053.MP4,IMG_0054.MP4,IMG_0055.MP4
```

### How the flight is cut

The reels are separate clips, not one drone take. The script builds one continuous forward move out of them:

- **Only shots that move forward (or read as forward) are used.** The lake, waterfall and flag shots move sideways, so they're out. The approach to the café front is the drone *pulling away*, played in reverse.
- **Every shot has a steady push-in.** The zoom is supersampled at 3× so it never jitters.
- **Cuts are fly-throughs, not cross-fades between still scenes.** Over 0.6 s the outgoing shot accelerates into its frame while the incoming one decelerates out of a zoom.
- **The last shot eases out and holds 1.2 s,** so the camera visibly settles before the menu appears.

The script prints each shot's start time. If the shot list changes, update `flightChapters` in `src/data/cafe.ts` so the words still land on the right shots.

| Output | Size | Notes |
| --- | --- | --- |
| `journey-mobile.mp4` / `.webm` | 1.6 / 1.6 MB | 504×624, 15.1 s |
| `journey-desktop.mp4` / `.webm` | 4.6 / 3.8 MB | 756×936 |
| `journey-poster.webp` | 16 KB | first frame, preloaded only on `/` |
| `journey-end-{400,800}.webp` | 13–26 KB | the settled last frame |
| `<still>-{400,800,1200}.webp` | 13–138 KB | story / gallery stills, served via `srcset` |

**The single biggest upgrade is the original drone files.** The Reels crop is only 504 px wide, and the shots are short. With raw footage, change `CROP` and `SHOTS` in the script and re-run it.

## The flight, step by step

1. **Loading:** the poster is painted at once; it is the film's first frame, and also the LCP element. The film is fetched in full (1.6 MB on phones) before take-off, so it never stalls mid-air. The title rises in meanwhile, and **Skip intro** is always available.
2. **Playing:** the words surface as the camera passes each landmark, and a hairline at the bottom tracks progress. The film pauses when the hero is scrolled off-screen or the tab is hidden, and resumes on return.
3. **Arrived:** this starts only when the film has *ended* (or on Skip). The camera drifts in a few more percent and settles, the lower frame dims, *"You're here. Your table is ready."* rises, and then the menu slides up like a sheet. Until then the menu is hidden and `inert`. The nav's Order button also waits.
4. **Autoplay refused** (e.g. iOS Low Power Mode): a **Begin the flight** button appears. If the film can't play at all, the hero lands straight away, so the menu is never out of reach.
5. **Returning** to `/` from the menu within the app lands immediately. A reload flies again.
6. **Reduced motion or Data Saver:** no film is downloaded. The hero opens already landed on the settled frame, with the menu in place.

The landed menu is a working one. Items can be added right there, the category chips deep-link to `/menu#cat-…`, and the cart carries over.

## Performance and loading

- Fonts are self-hosted, Latin subset only. ₹ falls back to the system font, which saves an 85 KB download.
- Overlays are driven from the film's clock with direct style writes, never React re-renders. That loop only runs while the film is actually playing.
- Gzipped JavaScript: about 103 KB shared, plus about 5–6 KB for each route chunk.

## Accessibility

Every control is at least 44 px. Focus states are visible. The cart, table picker and full-screen navigation are modal dialogs: focus moves in, is trapped, and returns to the control that opened them, and Escape closes them. Cart changes are announced through a polite live region ("Veg Momos added. 3 items in your order, ₹560."). The quantity buttons have item-specific labels, and the inactive half of the Add↔stepper control is `inert`. A "Skip the intro" link (the first thing you can tab to) lands the flight and moves focus to the menu.

## Placeholders to replace

- **Menu items and prices**: `src/data/menu.ts`.
- **Food images**: no food photos were supplied, so each dish is drawn as a top-down SVG illustration (`FoodArt.tsx`). To use a photo, add `photo: '/media/menu/<name>'` to an item and provide `<name>-400.webp` and `<name>-800.webp`. The card switches to the photo automatically.
- **Hours, address, altitude, Instagram**: `src/data/cafe.ts`.
