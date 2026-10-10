#!/usr/bin/env bash
# Builds every video/image asset the site uses from the three source reels.
#
#   bash scripts/build-media.sh <dir-with-IMG_0053.MP4,IMG_0054.MP4,IMG_0055.MP4>
#
# The source files are 576x1280 Instagram Reels screen recordings. The reel
# captions, status bar, like/share icons and comment bar are burned into the
# pixels, so every asset is cropped to the clean window between them:
#   x 0..504, y 360..984  ->  504x624 (portrait, ~0.81)
# If raw drone footage becomes available, replace CROP with "iw:ih" (or a
# portrait crop of the raw frame) and re-run.
set -euo pipefail

SRC="${1:?usage: build-media.sh <source-dir>}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/public/media"
mkdir -p "$OUT"

pick() { ls "$SRC" | grep -i "$1" | head -1; }
V53="$SRC/$(pick IMG_0053)"
V54="$SRC/$(pick IMG_0054)"
V55="$SRC/$(pick IMG_0055)"

CROP="crop=504:624:0:360"
FPS=24
XF=0.6     # fly-through length between shots
TAIL=1.2   # the last frame is held while the camera settles

# --- 1. The drone flight ------------------------------------------------------
# One forward camera move: mountains -> valley -> the café appears -> fly at
# its glass front -> the door -> inside -> tilt down to the window wall.
# Only shots whose own motion is forward (or reads forward) are used; shot
# "rev" is the drone pulling away from the café, played backwards.
#
# Every shot gets a continuous push-in. Across each cut the outgoing shot
# accelerates into its frame while the incoming one decelerates out of a zoom,
# so the cut reads as flying through rather than as a new scene.
#
#   file  start  dur  focus-x focus-y  flags
SHOTS=(
  "$V54 0.05  1.80 0.50 0.45 -"    # clouds pouring over the cliffs
  "$V54 2.20  1.30 0.55 0.70 -"    # the mountain flank, valley floor below
  "$V53 17.90 1.40 0.55 0.55 -"    # down over the village
  "$V53 9.60  2.10 0.50 0.62 -"    # the blue roof comes into view
  "$V53 0.70  2.70 0.50 0.08 rev"  # flying at the café's glass front
  "$V54 3.80  1.60 0.42 0.45 -"    # the front door, the sign above
  "$V54 6.80  1.40 0.45 0.62 -"    # through the door
  "$V54 8.35  2.80 0.50 0.45 -"    # inside: prayer flags, the games tables
  "$V55 0.10  3.60 0.50 0.62 last" # tilt down: booths, window wall, Himalaya
)

PUSH=0.10    # zoom gained across each shot
IN_B=0.14    # extra zoom an incoming shot starts with
OUT_B=0.22   # extra zoom an outgoing shot flies into
W=756; H=936 # master size; the mobile cut is scaled from it

n=${#SHOTS[@]}
inputs=()
filter=""
total=0
starts=()
for ((k = 0; k < n; k++)); do
  read -r f ss d fx fy flag <<<"${SHOTS[$k]}"
  inputs+=(-ss "$ss" -t "$d" -i "$f")
  len=$d
  pre="[$k:v]$CROP,fps=$FPS"
  [[ $flag == rev ]] && pre+=",reverse"
  pre+=",setpts=PTS-STARTPTS"
  if [[ $flag == last ]]; then
    pre+=",tpad=stop_mode=clone:stop_duration=$TAIL"
    len=$(awk -v d="$d" -v t="$TAIL" 'BEGIN{print d+t}')
  fi
  N=$(awk -v l="$len" -v r="$FPS" 'BEGIN{printf "%d", l*r+0.5}')
  t="(on/$FPS)"
  u="(on/$((N - 1)))"
  sm() { echo "(($1)*($1)*(3-2*($1)))"; } # smoothstep
  if [[ $flag == last ]]; then
    # Ease out: the camera slows and settles in its seat.
    z="1+$PUSH*1.4*(1-(1-$u)*(1-$u))"
  else
    z="1+$PUSH*$u"
  fi
  ((k > 0)) && z+="+$IN_B*(1-$(sm "clip($t/$XF,0,1)"))"
  [[ $flag != last ]] && z+="+$OUT_B*$(sm "clip(($t-($len-$XF))/$XF,0,1)")"
  filter+="$pre,scale=$((W * 3)):$((H * 3)):flags=lanczos,"
  filter+="zoompan=z='$z':x='$fx*(iw-iw/zoom)':y='$fy*(ih-ih/zoom)':d=1:s=${W}x${H}:fps=$FPS,"
  filter+="eq=saturation=1.05:contrast=1.04,colorbalance=rm=0.02:bh=-0.02,format=yuv420p[s$k];"
  # Running start time of each shot, for the overlays in src/data/cafe.ts.
  if ((k == 0)); then starts+=(0); total=$d; else
    starts+=("$(awk -v t="$total" -v x="$XF" 'BEGIN{printf "%.2f", t-x}')")
    total=$(awk -v t="$total" -v l="$len" -v x="$XF" 'BEGIN{printf "%.3f", t+l-x}')
  fi
done

prev="s0"
for ((k = 1; k < n; k++)); do
  filter+="[$prev][s$k]xfade=transition=fade:duration=$XF:offset=${starts[$k]}[x$k];"
  prev="x$k"
done
filter="${filter%;}"
filter="${filter%\[x$((n - 1))\]}"
echo "flight length: ${total}s   shot starts: ${starts[*]}"

X264="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -g 48"
MASTER="$OUT/.journey-master.mp4"
ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filter[out]" -map "[out]" $X264 -crf 14 "$MASTER"

ffmpeg -v error -y -i "$MASTER" -vf "scale=504:624:flags=lanczos" $X264 -crf 27 "$OUT/journey-mobile.mp4"
ffmpeg -v error -y -i "$MASTER" -vf "unsharp=5:5:0.4" $X264 -crf 24 "$OUT/journey-desktop.mp4"
rm "$MASTER"

# VP9 fallbacks for browsers built without H.264 (e.g. open-source Chromium).
VP9="-c:v libvpx-vp9 -b:v 0 -g 48 -row-mt 1 -deadline good -cpu-used 2 -an -pix_fmt yuv420p"
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" $VP9 -crf 40 "$OUT/journey-mobile.webm"
ffmpeg -v error -y -i "$OUT/journey-desktop.mp4" $VP9 -crf 36 "$OUT/journey-desktop.webm"

# Poster = the opening frame (clouds), so the hero paints before any video bytes.
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" -frames:v 1 -c:v libwebp -quality 72 "$OUT/journey-poster.webp"
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" -frames:v 1 -vf "scale=180:-2,gblur=sigma=4" -c:v libwebp -quality 40 "$OUT/journey-poster-tiny.webp"

# The settled last frame: the reduced-motion hero, and what stays on screen
# behind the menu.
ffmpeg -v error -sseof -0.1 -y -i "$OUT/journey-desktop.mp4" -frames:v 1 -update 1 "$OUT/.tmp-end.png"
for w in 400 800; do
  ffmpeg -v error -y -i "$OUT/.tmp-end.png" -vf "scale=$w:-2:flags=lanczos" -c:v libwebp -quality 74 "$OUT/journey-end-$w.webp"
done
rm "$OUT/.tmp-end.png"

# --- 2. Stills for the story, gallery and menu --------------------------------
STILLS=(
  "interior-windows $V55 1.60"
  "terrace         $V55 5.50"
  "terrace-table   $V55 8.40"
  "sign            $V54 7.60"
  "flags           $V54 6.20"
  "storefront      $V54 4.60"
  "games-room      $V54 9.80"
  "cafe-aerial     $V53 8.80"
  "cafe-village    $V53 12.80"
  "lake            $V53 4.30"
  "balcony         $V53 6.10"
  "waterfall       $V53 17.30"
  "clouds          $V54 0.60"
)
for s in "${STILLS[@]}"; do
  read -r name f ss <<<"$s"
  ffmpeg -v error -y -ss "$ss" -i "$f" -frames:v 1 -vf "$CROP,eq=saturation=1.04:contrast=1.03" "$OUT/.tmp-$name.png"
  ffmpeg -v error -y -i "$OUT/.tmp-$name.png" -vf "scale=400:-2:flags=lanczos" -c:v libwebp -quality 74 "$OUT/$name-400.webp"
  ffmpeg -v error -y -i "$OUT/.tmp-$name.png" -vf "scale=800:-2:flags=lanczos,unsharp=5:5:0.5" -c:v libwebp -quality 72 "$OUT/$name-800.webp"
  ffmpeg -v error -y -i "$OUT/.tmp-$name.png" -vf "scale=1200:-2:flags=lanczos,unsharp=5:5:0.6" -c:v libwebp -quality 70 "$OUT/$name-1200.webp"
  rm "$OUT/.tmp-$name.png"
done

ls -la "$OUT"
