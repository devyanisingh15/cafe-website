# Havana Café · Sissu

A mobile-first website for a small mountain café. It works in two modes:

- **`/` — the cinematic hero.** A ~10-second golden-hour drone approach plays behind a fixed headline. It opens on an elevated establishing shot of the café among the village and mountains, pushes slowly toward its glass front, flies through the door, and settles inside on the window wall.
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
| `/` | Cinematic hero → story → gallery → visit |
| `/menu` | Ordering app. Asks the guest to pick a table. |
| `/menu?table=07` | Ordering app for table 07. This is the URL to print on each table's QR code. |

Each route is its own code-split chunk, so a QR scan never downloads the film or its scripts. A table number from the URL is remembered for the browser tab. A refresh or a visit to `/` keeps it. A table number that doesn't exist (for example `?table=99`) makes the app ask for the table instead of guessing.

The app is a single-page app. `public/_redirects` (Netlify) and `vercel.json` send deep links like `/menu?table=07` to `index.html`. Other hosts need the same rewrite.

## Where things live

```
src/
├── components/
│   ├── MobileHero.tsx           the hero: film, atmosphere layers, headline, pause
│   ├── HeroVideo.tsx            poster → film; wide / phone / tablet + mp4/webm sources
│   ├── MobileNavigation.tsx     brand · links · CTA; floating pill; full-screen menu
│   ├── DishImage.tsx            a dish's photo, or its drawn plate
│   ├── CafeStory.tsx / CafeGallery.tsx / Footer.tsx
│   ├── Menu.tsx                 the ordering app (tabs, scroll-spy, flow)
│   ├── CategoryTabs.tsx  MenuCard.tsx  QtyControl.tsx  FoodArt.tsx
│   ├── FloatingCart.tsx  CartSheet.tsx  TablePicker.tsx  Sheet.tsx
│   └── OrderConfirmation.tsx
├── hooks/
│   ├── useDroneFlight.ts   loads + autoplays the film once; pause/resume; settles
│   ├── useCart.tsx         cart context, sessionStorage, screen-reader messages
│   ├── useTableNumber.ts   ?table= parsing/validation, table list
│   └── useReveal.ts        one IntersectionObserver for scroll reveals
├── data/
│   ├── cafe.ts   name, hours, links, hero copy, gallery
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

### How the hero film is made

The reels are separate clips, not one drone take. The script builds a single continuous approach from them, modelled on a cinematic real-estate hero:

| Time | Beat | Shot |
| --- | --- | --- |
| 0–2 s | Establishing | Elevated view of the café among the village and mountains; slow sideways drift, almost no zoom |
| 1.6–4 s | Drone push-in | The drone's real approach to the glass front (a pull-away clip played in reverse) |
| 3.5–5.8 s | Approach | The front door, then under the sign, flying through |
| 5.3–9.8 s | Settle | Inside: a tilt down from the chandeliers to the window wall; long ease-out, then a hold |

How it's built:

- **The camera move:** each shot carries its own move, and the zoom is supersampled 2× so it never jitters. The move eases in and out, and the framing drifts slightly sideways or upwards.
- **The cuts:** each one is a fly-through. Over 0.5 s, the outgoing shot accelerates into its frame while the next one decelerates out of a zoom.
- **Motion blur:** the move is rendered at 72 fps and blended down to 24 fps. That gives real motion blur, and only where the camera moves fast.
- **The look:** a golden-hour grade (warm highlights, a rosy sky, soft lifted shadows, with the blue roof and booths kept blue), a soft glow, a low sun from the top left, and slightly softened edges. All of it is baked into the film.
- **CSS layers on top:** grain, a vignette, a warm haze and the readability gradient. These stay out of the video so it compresses well.
- **Wide screens** get their own 1600×1000 composition rather than a stretched crop. The sharp portrait shot sits centred at native size, and its sides dissolve into a blurred extension of the same frame.

| Output | Size | Used on |
| --- | --- | --- |
| `journey-mobile.mp4` / `.webm` | 0.9 / 0.6 MB | phones (504×624) |
| `journey-desktop.mp4` / `.webm` | 2.4 / 1.4 MB | portrait tablets (756×936) |
| `journey-wide.mp4` / `.webm` | 2.9 / 1.5 MB | landscape screens ≥ 900 px (1600×1000) |
| `journey-poster.webp`, `journey-wide-poster.webp` | 19 / 34 KB | first frame, preloaded only on `/` |
| `journey-end-*.webp`, `journey-wide-end.webp` | 9–24 KB | the settled last frame |

**The single biggest upgrade is the original drone files.** The Reels crop is only 504 px wide, and the shots are short. With raw footage, change `CROP` and `SHOTS` in the script and re-run it.

## The hero, step by step

1. **Loading:** the poster (the film's first frame) paints at once. The nav, headline and supporting text fade in over it. The film is fetched in full before it starts, so the camera never stalls mid-move.
2. **Playing:** the film plays once. A small pause button (bottom right) is there because the motion runs longer than 5 s. The film also pauses when scrolled off-screen or when the tab is hidden, and resumes on return.
3. **Settled:** the film ends on its eased-out last frame and stays there. It doesn't loop, because the cinematic entrance matters more than a loop. Returning to `/` within the app shows the settled frame straight away.
4. **Autoplay refused** (e.g. iOS Low Power Mode): the poster stays, and the button plays the film.
5. **Reduced motion or Data Saver:** no film is downloaded. The hero shows the settled final composition, and the UI simply fades in.

## Performance and loading

- Fonts are self-hosted, Latin subset only. ₹ falls back to the system font, which saves an 85 KB download.
- The hero runs no JavaScript per frame. Grain moves by `transform` only. Measured over 5 s of playback with the CPU throttled 4×: 9 ms of script, 1 layout, no long tasks, and CLS 0.011.
- Gzipped JavaScript: about 103 KB shared, plus about 5–6 KB for each route chunk.

## Accessibility

Every control is at least 44 px. Focus states are visible. The cart, table picker and full-screen navigation are modal dialogs: focus moves in, is trapped, and returns to the control that opened them, and Escape closes them. Cart changes are announced through a polite live region ("Veg Momos added. 3 items in your order, ₹560."). The quantity buttons have item-specific labels, and the inactive half of the Add↔stepper control is `inert`. A "Skip to content" link is the first thing you can tab to, and the hero film has a pause/play control.

## Placeholders to replace

- **Menu**: `src/data/menu.ts` holds a mock menu of 41 dishes across six categories. Each dish has a price, a diet type (veg / vegan / egg / non-veg, marked the Indian way), a spice level, a prep time, an optional tag, and a `soldOut` flag. The trout is marked sold out, to show that state.
- **Dish photos**: put full-size photos named by dish id (e.g. `cappuccino.jpg`) in a folder, then run:

  ```bash
  bash scripts/build-menu-photos.sh /path/to/photos
  ```

  The script centre-crops each photo to the card's 16:10 and writes `public/media/menu/<id>-400.webp` and `-800.webp`. It also regenerates `src/data/menu-photos.ts`, the list of dishes that have a photo. Any dish without a photo falls back to its drawn plate (`FoodArt.tsx`).
- **Hours, address, altitude, Instagram**: `src/data/cafe.ts`.
