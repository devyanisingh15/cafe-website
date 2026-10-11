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
FPS=24     # delivered frame rate
SUB=72     # the camera move is rendered at 72 fps, then blended to 24 fps
XF=0.5     # fly-through length between shots
TAIL=0.9   # the last frame is held while the camera settles

# --- 1. The hero film ---------------------------------------------------------
# One ~10 s drone approach, golden hour: an elevated establishing shot of the
# café among the village and mountains → the real forward approach to its
# glass front → the front door → the sign → inside, a slow tilt down to the
# window wall where the camera settles.
#
# Shot "rev" is the drone pulling away from the café, played backwards.
# Every shot carries its own camera move (zoom = forward travel, focus drift =
# slight lateral/elevation change). Across each cut the outgoing shot
# accelerates into its frame while the incoming one decelerates out of a
# zoom, so it reads as flying through, not as a cut. Rendering the move at
# 72 fps and blending to 24 fps gives real motion blur — only where the
# camera is moving fast.
#
# z0 is the shot's base framing (1 = whole clean frame), push the zoom it
# gains as the camera travels, fx/fy where the camera is aimed (0–1).
#
#   file  start dur  fx0  fx1  fy0  fy1  z0   push  flags
SHOTS=(
  "$V53 9.60  2.10 0.40 0.52 0.58 0.55 1.00 0.04 -"     # establishing: village, café, mountains
  "$V53 1.00  2.40 0.50 0.50 0.00 0.06 1.40 0.12 rev"   # flying at the café's glass front
  "$V54 3.80  1.50 0.42 0.46 0.45 0.50 1.00 0.10 -"     # the front door
  "$V54 6.80  1.30 0.45 0.50 0.62 0.66 1.00 0.14 -"     # under the sign, into the door
  "$V55 0.10  3.60 0.50 0.50 0.36 0.34 1.00 0.05 last"  # inside: tilt down to the window wall
)

IN_B=0.20  # extra zoom an incoming shot starts with
OUT_B=0.34 # extra zoom an outgoing shot flies into
W=756; H=936

# Golden-hour grade: warm highlights, rosy sky, soft lifted shadows; blues
# (the roof, the booths) stay blue.
GRADE="colorbalance=rs=0.04:gs=-0.01:bs=0.03:rm=0.07:gm=0.0:bm=-0.06:rh=0.12:gh=0.02:bh=-0.04,curves=r='0/0.05 0.45/0.52 1/1':g='0/0.03 0.5/0.48 1/0.93':b='0/0.07 0.5/0.45 1/0.88',eq=saturation=1.05:contrast=0.97"

# Static layers, made once: a low sun glow from the top left, and an elliptical
# mask that softens the frame's edges (a hint of depth of field).
LAYERS="$(mktemp -d)"
SUNF="pow(max(0\,1-hypot(X-W*0.12\,Y-H*0.02)/(W*1.05))\,1.6)"
ffmpeg -v error -y -f lavfi -i "color=black:s=${W}x${H},format=gbrp" -frames:v 1 \
  -vf "geq=r='235*$SUNF':g='120*$SUNF':b='90*$SUNF'" "$LAYERS/sun.png"
ffmpeg -v error -y -f lavfi -i "color=black:s=${W}x${H},format=gray" -frames:v 1 \
  -vf "geq=lum='255*clip((hypot((X-W/2)/(W*0.5)\,(Y-H*0.47)/(H*0.5))-0.62)/0.45\,0\,1)'" "$LAYERS/dof.png"

n=${#SHOTS[@]}
inputs=()
filter=""
total=0
starts=()
sm() { echo "(($1)*($1)*(3-2*($1)))"; } # smoothstep
for ((k = 0; k < n; k++)); do
  read -r f ss d fx0 fx1 fy0 fy1 z0 push flag <<<"${SHOTS[$k]}"
  inputs+=(-ss "$ss" -t "$d" -i "$f")
  len=$d
  pre="[$k:v]$CROP,fps=$SUB"
  [[ $flag == rev ]] && pre+=",reverse"
  pre+=",setpts=PTS-STARTPTS"
  if [[ $flag == last ]]; then
    pre+=",tpad=stop_mode=clone:stop_duration=$TAIL"
    len=$(awk -v d="$d" -v t="$TAIL" 'BEGIN{print d+t}')
  fi
  N=$(awk -v l="$len" -v r="$SUB" 'BEGIN{printf "%d", l*r+0.5}')
  t="(on/$SUB)"
  u="(on/$((N - 1)))"
  e=$(sm "$u") # eased progress through the shot
  if [[ $flag == last ]]; then
    z="$z0+$push*(1-(1-$u)*(1-$u)*(1-$u))" # long ease-out: the camera settles
  else
    z="$z0+$push*$e"
  fi
  ((k > 0)) && z+="+$IN_B*(1-$(sm "clip($t/$XF,0,1)"))"
  [[ $flag != last ]] && z+="+$OUT_B*$(sm "clip(($t-($len-$XF))/$XF,0,1)")*$(sm "clip(($t-($len-$XF))/$XF,0,1)")"
  fx="($fx0+($fx1-$fx0)*$e)"
  fy="($fy0+($fy1-$fy0)*$e)"
  filter+="$pre,scale=$((W * 2)):$((H * 2)):flags=lanczos,"
  filter+="zoompan=z='$z':x='$fx*(iw-iw/zoom)':y='$fy*(ih-ih/zoom)':d=1:s=${W}x${H}:fps=$SUB,format=yuv420p[s$k];"
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
# Motion blur (3 × 1/72 s ≈ a 1/24 s shutter), then grade, glow, sun, soft edges.
filter+="[$prev]tmix=frames=3:weights='1 2 1',fps=$FPS,format=gbrp,$GRADE,format=gbrp,split=3[c0][c1][c2];"
filter+="[c1]gblur=sigma=16[glow];[c0][glow]blend=all_mode=screen:all_opacity=0.18[g1];"
filter+="[$n:v]format=gbrp,scale=$W:$H[sun];[g1][sun]blend=all_mode=screen:all_opacity=0.5[g2];"
filter+="[c2]gblur=sigma=3.5[soft];"
filter+="[g2]format=gbrp[g3];[soft]format=gbrp[soft2];[$((n + 1)):v]format=gray,scale=$W:$H[mask];"
filter+="[g3][soft2][mask]maskedmerge,format=yuv420p[out]"
echo "film length: ${total}s   shot starts: ${starts[*]}"

X264="-c:v libx264 -preset slow -profile:v high -pix_fmt yuv420p -movflags +faststart -an -g 48"
MASTER="$OUT/.journey-master.mp4"
ffmpeg -v error -y "${inputs[@]}" -loop 1 -i "$LAYERS/sun.png" -loop 1 -i "$LAYERS/dof.png" \
  -filter_complex "$filter" -map "[out]" -t "$total" $X264 -crf 14 "$MASTER"
rm -r "$LAYERS"

ffmpeg -v error -y -i "$MASTER" -vf "scale=504:624:flags=lanczos" $X264 -crf 26 "$OUT/journey-mobile.mp4"
ffmpeg -v error -y -i "$MASTER" $X264 -crf 23 "$OUT/journey-desktop.mp4"

# Wide screens (landscape, ≥ 900 px): the film is portrait, so rather than
# stretching it, the sharp shot sits centred at native size and its sides
# dissolve into a soft, blurred extension of the same frame. 1600×1000 covers
# 16:10 and 16:9 screens with a little crop.
WW=1600; WH=1000; FW=808
ffmpeg -v error -y -f lavfi -i "color=black:s=${FW}x${WH},format=gray" -frames:v 1 \
  -vf "geq=lum='255*clip(min(X\,W-X)/(W*0.16)\,0\,1)'" "$OUT/.feather.png"
ffmpeg -v error -y -i "$MASTER" -loop 1 -i "$OUT/.feather.png" -filter_complex "
  [0]split[a][b];
  [a]scale=$WW:-2,crop=$WW:$WH,gblur=sigma=36,eq=brightness=-0.04:saturation=1.1[bg];
  [b]scale=$FW:$WH:flags=lanczos,format=rgba[fg];
  [1]format=gray[m];[fg][m]alphamerge[fgm];
  [bg][fgm]overlay=(W-w)/2:0:shortest=1,format=yuv420p" \
  $X264 -crf 24 "$OUT/journey-wide.mp4"
rm "$MASTER" "$OUT/.feather.png"

# VP9 fallbacks for browsers built without H.264 (e.g. open-source Chromium).
VP9="-c:v libvpx-vp9 -b:v 0 -g 48 -row-mt 1 -deadline good -cpu-used 2 -an -pix_fmt yuv420p"
ffmpeg -v error -y -i "$OUT/journey-mobile.mp4" $VP9 -crf 40 "$OUT/journey-mobile.webm"
ffmpeg -v error -y -i "$OUT/journey-desktop.mp4" $VP9 -crf 36 "$OUT/journey-desktop.webm"
ffmpeg -v error -y -i "$OUT/journey-wide.mp4" $VP9 -crf 37 "$OUT/journey-wide.webm"

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
ffmpeg -v error -y -i "$OUT/journey-wide.mp4" -frames:v 1 -c:v libwebp -quality 70 "$OUT/journey-wide-poster.webp"
ffmpeg -v error -sseof -0.1 -y -i "$OUT/journey-wide.mp4" -frames:v 1 -update 1 -c:v libwebp -quality 72 "$OUT/journey-wide-end.webp"

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
