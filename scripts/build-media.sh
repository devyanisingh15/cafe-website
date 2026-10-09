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
XF=0.4 # crossfade length between shots

# --- 1. The journey edit -----------------------------------------------------
# Shot list, in story order: clouds -> mountains -> valley -> village ->
# the café appears -> fly in -> exterior -> prayer flags -> sign -> inside.
# Each shot is cut 50–150 ms inside a detected scene boundary.
SHOTS=(
  "$V54 0.05 2.00"   # clouds rolling over the cliff
  "$V54 2.20 1.50"   # bare mountain slope, blue sky
  "$V53 3.55 1.70"   # glacial lake below the peaks
  "$V53 16.85 0.95"  # waterfall valley
  "$V53 17.90 1.55"  # village from above
  "$V53 9.60 2.25"   # the blue roof among the houses
  "$V53 8.15 1.35"   # drone close over the café
  "$V54 3.80 1.70"   # exterior, at the road
  "$V54 5.60 1.10"   # prayer flags at the door
  "$V54 6.80 1.45"   # the sign
  "$V54 8.35 3.05"   # inside: flags, foosball
  "$V55 0.10 3.60"   # inside: the window wall and the Himalaya
)

inputs=()
filter=""
i=0
for s in "${SHOTS[@]}"; do
  read -r f ss d <<<"$s"
  inputs+=(-ss "$ss" -t "$d" -i "$f")
  filter+="[$i:v]$CROP,fps=$FPS,setpts=PTS-STARTPTS,format=yuv420p[s$i];"
  i=$((i + 1))
done

# Chain xfades; offset = running duration minus the crossfade.
prev="s0"
read -r _ _ total <<<"${SHOTS[0]}"
for ((k = 1; k < ${#SHOTS[@]}; k++)); do
  read -r _ _ d <<<"${SHOTS[$k]}"
  off=$(awk -v t="$total" -v x="$XF" 'BEGIN{printf "%.3f", t-x}')
  filter+="[$prev][s$k]xfade=transition=fade:duration=$XF:offset=$off[x$k];"
  prev="x$k"
  total=$(awk -v t="$total" -v d="$d" -v x="$XF" 'BEGIN{printf "%.3f", t+d-x}')
done
filter+="[$prev]eq=saturation=1.04:contrast=1.03,null[base]"
echo "journey length: ${total}s"

# Short GOP so the browser can seek to any scroll position quickly.
X264="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -g 6 -keyint_min 6 -sc_threshold 0"

ffmpeg -v error -y "${inputs[@]}" -filter_complex "$filter" -map "[base]" \
  $X264 -crf 29 "$OUT/journey-mobile.mp4"

ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" \
  -vf "scale=756:936:flags=lanczos,unsharp=5:5:0.6" \
  $X264 -crf 25 "$OUT/journey-desktop.mp4"

# VP9 fallbacks for browsers built without H.264 (e.g. open-source Chromium).
VP9="-c:v libvpx-vp9 -b:v 0 -g 6 -row-mt 1 -deadline good -cpu-used 2 -an -pix_fmt yuv420p"
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" $VP9 -crf 40 "$OUT/journey-mobile.webm"
ffmpeg -v error -y -i "$OUT/journey-desktop.mp4" $VP9 -crf 36 "$OUT/journey-desktop.webm"

# Poster = the opening frame (clouds), so the hero paints before any video bytes.
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" -frames:v 1 -c:v libwebp -quality 72 "$OUT/journey-poster.webp"
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" -frames:v 1 -vf "scale=180:-2,gblur=sigma=4" -c:v libwebp -quality 40 "$OUT/journey-poster-tiny.webp"

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
