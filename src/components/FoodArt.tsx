import { memo, useId } from 'react'

export type ArtKind =
  | 'cup'
  | 'cup-black'
  | 'glass'
  | 'chai'
  | 'teacup'
  | 'paratha'
  | 'siddu'
  | 'omelette'
  | 'pancakes'
  | 'bowl'
  | 'rice'
  | 'momos'
  | 'fries'
  | 'sandwich'
  | 'crumble'
  | 'brownie'
  | 'cake'

interface Props {
  kind: ArtKind
  bg: string
  tint?: string
  label: string
}

/**
 * Top-down, editorial-style plate illustrations on a linen tone. They stand in
 * for food photography until the café shoots its own (see MenuItem.photo).
 */
function FoodArtImpl({ kind, bg, tint, label }: Props) {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 320 200" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice">
      <defs>
        <filter id={`sh${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <pattern id={`ln${id}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
          <path d="M0 3h6" stroke="#000" strokeOpacity=".035" strokeWidth="1" />
        </pattern>
        <radialGradient id={`lt${id}`} cx="35%" cy="25%" r="85%">
          <stop offset="0" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#000" stopOpacity=".12" />
        </radialGradient>
      </defs>
      <rect width="320" height="200" fill={bg} />
      <rect width="320" height="200" fill={`url(#ln${id})`} />
      <g filter={`url(#sh${id})`} opacity=".22" transform="translate(9 11)">
        <Silhouette kind={kind} />
      </g>
      <Dish kind={kind} tint={tint} />
      <rect width="320" height="200" fill={`url(#lt${id})`} />
    </svg>
  )
}

export const FoodArt = memo(FoodArtImpl)

/** Rough outline of each dish, used only to cast its shadow. */
function Silhouette({ kind }: { kind: ArtKind }) {
  switch (kind) {
    case 'chai':
      return (
        <>
          <circle cx="128" cy="100" r="34" />
          <circle cx="198" cy="96" r="34" />
        </>
      )
    case 'fries':
      return <rect x="98" y="46" width="124" height="108" rx="16" />
    case 'sandwich':
      return <rect x="72" y="40" width="176" height="120" rx="14" />
    case 'glass':
      return <circle cx="160" cy="100" r="50" />
    default:
      return <circle cx="160" cy="100" r="80" />
  }
}

const Plate = ({ r = 80 }: { r?: number }) => (
  <>
    <circle cx="160" cy="100" r={r} fill="#f8f4ed" />
    <circle cx="160" cy="100" r={r - 12} fill="none" stroke="#e8e0d3" strokeWidth="2" />
  </>
)

function Saucer({ liquid, art, extra }: { liquid: string; art?: 'heart' | 'crema' | 'none'; extra?: React.ReactNode }) {
  return (
    <>
      <circle cx="160" cy="100" r="74" fill="#f4efe6" />
      <circle cx="160" cy="100" r="64" fill="none" stroke="#e6dccd" strokeWidth="2" />
      <rect x="196" y="92" width="38" height="16" rx="8" fill="#fbf8f2" stroke="#e3d9ca" />
      <circle cx="160" cy="100" r="48" fill="#fbf8f2" stroke="#e7ded0" strokeWidth="2" />
      <circle cx="160" cy="100" r="40" fill={liquid} />
      {art === 'heart' && (
        <>
          <circle cx="160" cy="100" r="40" fill="none" stroke="#000" strokeOpacity=".12" strokeWidth="4" />
          <path
            d="M160 124c-14-9-26-19-26-31 0-8 6-14 13-14 6 0 10 3 13 8 3-5 7-8 13-8 7 0 13 6 13 14 0 12-12 22-26 31Z"
            fill="#f6ead9"
            opacity=".92"
          />
          <path d="M160 79v42" stroke={liquid} strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {art === 'crema' && (
        <>
          <circle cx="160" cy="100" r="40" fill="none" stroke="#7a4a28" strokeWidth="6" opacity=".7" />
          <path d="M146 92c8-6 22-4 26 5" stroke="#8a5631" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6" />
        </>
      )}
      {art === 'none' && <ellipse cx="148" cy="88" rx="12" ry="6" fill="#fff" opacity=".22" />}
      <path d="M106 150l22-16" stroke="#cfc6b8" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="102" cy="153" rx="9" ry="6" fill="#cfc6b8" transform="rotate(-36 102 153)" />
      {extra}
    </>
  )
}

function Dish({ kind, tint }: { kind: ArtKind; tint?: string }) {
  switch (kind) {
    case 'cup':
      return <Saucer liquid={tint ?? '#c89b6d'} art="heart" />
    case 'cup-black':
      return <Saucer liquid="#3a2216" art="crema" />
    case 'teacup':
      return (
        <Saucer
          liquid={tint ?? '#d9a53a'}
          art="none"
          extra={
            <g>
              <circle cx="232" cy="142" r="13" fill="#f2d24d" />
              <circle cx="232" cy="142" r="10" fill="#f7e58a" />
              <path d="M232 132v20M222 142h20M225 135l14 14M239 135l-14 14" stroke="#f2d24d" strokeWidth="1.5" />
            </g>
          }
        />
      )
    case 'glass':
      return (
        <>
          <circle cx="160" cy="100" r="50" fill="#eef2f2" opacity=".75" />
          <circle cx="160" cy="100" r="44" fill={tint ?? '#a8794f'} />
          <circle cx="160" cy="100" r="44" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="3" />
          <rect x="138" y="80" width="20" height="20" rx="5" fill="#fff" opacity=".45" transform="rotate(14 148 90)" />
          <rect x="164" y="96" width="18" height="18" rx="5" fill="#fff" opacity=".4" transform="rotate(-10 173 105)" />
          <circle cx="150" cy="116" r="12" fill="#f3e6d3" opacity=".9" />
          <path d="M176 82l52-40" stroke="#2e6a63" strokeWidth="7" strokeLinecap="round" />
          <circle cx="176" cy="82" r="5" fill="#24564f" />
        </>
      )
    case 'chai':
      return (
        <>
          {[128, 198].map((x, i) => (
            <g key={x} transform={`translate(${x} ${i ? 96 : 100})`}>
              <circle r="34" fill="#f1ede6" opacity=".85" />
              <circle r="28" fill="#c98a4f" />
              <circle r="28" fill="none" stroke="#a96c35" strokeWidth="3" opacity=".6" />
              <ellipse cx="-8" cy="-8" rx="9" ry="4" fill="#fff" opacity=".22" />
            </g>
          ))}
          <ellipse cx="248" cy="150" rx="7" ry="4" fill="#7e9b55" transform="rotate(30 248 150)" />
          <ellipse cx="262" cy="140" rx="7" ry="4" fill="#6f8c48" transform="rotate(-20 262 140)" />
          <circle cx="78" cy="148" r="18" fill="#d9a65e" />
          {[[-6, -5], [5, -6], [0, 4], [-7, 6], [7, 5]].map(([dx, dy], i) => (
            <circle key={i} cx={78 + dx} cy={148 + dy} r="1.6" fill="#a87336" />
          ))}
        </>
      )
    case 'paratha':
      return (
        <>
          <Plate />
          <circle cx="152" cy="102" r="56" fill="#d9a55a" />
          <circle cx="152" cy="102" r="56" fill="none" stroke="#c48d42" strokeWidth="3" />
          {[[-22, -18, 6], [14, -26, 4], [26, 8, 7], [-8, 22, 5], [-30, 10, 4], [6, 2, 3], [18, 30, 4]].map(([dx, dy, r], i) => (
            <circle key={i} cx={152 + dx} cy={102 + dy} r={r} fill="#a96f2f" opacity=".55" />
          ))}
          <path d="M152 46v112M96 102h112" stroke="#c48d42" strokeWidth="2" opacity=".5" />
          <path d="M160 88c8-6 20-2 20 6s-10 12-18 10-10-10-2-16Z" fill="#fbf6e6" />
          <circle cx="244" cy="58" r="22" fill="#f6f1e8" />
          <circle cx="244" cy="58" r="16" fill="#fbfaf6" />
          <circle cx="248" cy="148" r="20" fill="#f6f1e8" />
          <circle cx="248" cy="148" r="14" fill="#c4502a" />
          <circle cx="244" cy="144" r="3" fill="#e8a33b" />
        </>
      )
    case 'siddu':
      return (
        <>
          <Plate />
          {[[-30, -14, -18], [26, -18, 12], [0, 26, 0]].map(([dx, dy, rot], i) => (
            <g key={i} transform={`translate(${160 + dx} ${100 + dy}) rotate(${rot})`}>
              <ellipse rx="30" ry="21" fill="#efe1c6" />
              <path d="M-24 0c10-5 38-5 48 0" stroke="#d8c39c" strokeWidth="2" fill="none" />
              <ellipse rx="30" ry="21" fill="none" stroke="#e1cda8" strokeWidth="2" />
            </g>
          ))}
          <circle cx="250" cy="60" r="18" fill="#f6f1e8" />
          <circle cx="250" cy="60" r="12" fill="#f0c74e" />
          <circle cx="252" cy="146" r="18" fill="#f6f1e8" />
          <circle cx="252" cy="146" r="12" fill="#5f8f3a" />
        </>
      )
    case 'omelette':
      return (
        <>
          <Plate />
          <path d="M100 112c0-36 34-58 70-54 32 4 54 26 50 54Z" fill="#f0c24f" />
          <path d="M100 112h120" stroke="#d9a63a" strokeWidth="4" strokeLinecap="round" />
          {[[130, 92, '#4f8a3a'], [158, 80, '#c8432b'], [182, 96, '#4f8a3a'], [148, 102, '#c8432b'], [196, 84, '#4f8a3a'], [120, 104, '#e7e1d3']].map(
            ([x, y, c], i) => (
              <circle key={i} cx={x as number} cy={y as number} r="3" fill={c as string} />
            ),
          )}
          <rect x="118" y="122" width="36" height="34" rx="6" fill="#d89e55" transform="rotate(-8 136 139)" />
          <rect x="123" y="127" width="26" height="24" rx="4" fill="#efcf95" transform="rotate(-8 136 139)" />
          <rect x="160" y="124" width="36" height="34" rx="6" fill="#d89e55" transform="rotate(10 178 141)" />
          <rect x="165" y="129" width="26" height="24" rx="4" fill="#efcf95" transform="rotate(10 178 141)" />
        </>
      )
    case 'pancakes':
      return (
        <>
          <Plate />
          <circle cx="166" cy="106" r="52" fill="#c98f49" />
          <circle cx="160" cy="100" r="52" fill="#dca35d" />
          <circle cx="154" cy="94" r="50" fill="#e8b46a" />
          <circle cx="154" cy="94" r="38" fill="#eebd75" opacity=".7" />
          <path d="M126 84c14 10 30-6 44 4s22 2 26 14" stroke="#c97b12" strokeWidth="5" fill="none" strokeLinecap="round" opacity=".8" />
          <rect x="144" y="82" width="20" height="16" rx="3" fill="#fff4d0" />
          {[[118, 132], [128, 140], [196, 60], [206, 70], [212, 132], [110, 70]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="6.5" fill={i % 2 ? '#3b2a5e' : '#7a1f3d'} />
          ))}
        </>
      )
    case 'bowl':
      return (
        <>
          <circle cx="160" cy="100" r="72" fill="#28434c" />
          <circle cx="160" cy="100" r="72" fill="none" stroke="#3c606b" strokeWidth="3" />
          <circle cx="160" cy="100" r="62" fill={tint ?? '#d98b46'} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path
              key={i}
              d={`M${116 + i * 4} ${78 + i * 11}c12-10 22 10 34 0s22 10 34 0 18 6 26 2`}
              stroke="#f4dc9c"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          <circle cx="132" cy="70" r="6" fill="#4f8a3a" />
          <circle cx="190" cy="132" r="6" fill="#e0662c" />
          <circle cx="182" cy="74" r="5" fill="#4f8a3a" />
          <circle cx="128" cy="128" r="5" fill="#e0662c" />
          <path d="M214 30l-36 140M232 34l-44 136" stroke="#7b5232" strokeWidth="5" strokeLinecap="round" />
        </>
      )
    case 'rice':
      return (
        <>
          <Plate />
          <circle cx="136" cy="100" r="40" fill="#fbf9f3" />
          {Array.from({ length: 18 }, (_, i) => (
            <ellipse
              key={i}
              cx={136 + Math.cos(i * 2.4) * (8 + (i % 4) * 7)}
              cy={100 + Math.sin(i * 2.4) * (8 + (i % 4) * 7)}
              rx="4"
              ry="1.6"
              fill="#e7e1d4"
              transform={`rotate(${i * 37} ${136 + Math.cos(i * 2.4) * (8 + (i % 4) * 7)} ${100 + Math.sin(i * 2.4) * (8 + (i % 4) * 7)})`}
            />
          ))}
          <circle cx="196" cy="98" r="34" fill="#efe8dc" />
          <circle cx="196" cy="98" r="28" fill="#8a3a24" />
          {[[-10, -8], [6, -12], [12, 4], [-4, 8], [-14, 6], [2, -2]].map(([dx, dy], i) => (
            <ellipse key={i} cx={196 + dx} cy={98 + dy} rx="5" ry="3" fill="#6d2a19" transform={`rotate(${i * 50} ${196 + dx} ${98 + dy})`} />
          ))}
          <circle cx="190" cy="92" r="2.5" fill="#4f8a3a" />
          <circle cx="202" cy="104" r="2.5" fill="#4f8a3a" />
          <ellipse cx="160" cy="150" rx="10" ry="8" fill="none" stroke="#c78bb0" strokeWidth="3" />
          <path d="M108 54l8 6" stroke="#4f8a3a" strokeWidth="5" strokeLinecap="round" />
        </>
      )
    case 'momos':
      return (
        <>
          <circle cx="160" cy="100" r="78" fill="#c99d5e" />
          {[66, 58, 50].map((r) => (
            <circle key={r} cx="160" cy="100" r={r} fill="none" stroke="#b0844a" strokeWidth="1.5" />
          ))}
          {[[-30, -26], [8, -36], [36, -6], [22, 30], [-14, 34], [-38, 6], [0, 0]].map(([dx, dy], i) => (
            <g key={i} transform={`translate(${160 + dx} ${100 + dy})`}>
              <circle r="17" fill="#f4ede1" />
              <circle r="17" fill="none" stroke="#e0d4c1" strokeWidth="1.5" />
              {[0, 51, 103, 154, 206, 257, 309].map((a) => (
                <path key={a} d="M0 -3q7 -5 3 -13" stroke="#d6c7ae" strokeWidth="1.8" fill="none" strokeLinecap="round" transform={`rotate(${a + i * 9})`} />
              ))}
              <circle r="4" fill="#efe4d2" stroke="#d6c7ae" strokeWidth="1.2" />
            </g>
          ))}
          <circle cx="256" cy="150" r="20" fill="#f6f1e8" />
          <circle cx="256" cy="150" r="14" fill="#c8361f" />
        </>
      )
    case 'fries':
      return (
        <>
          <rect x="98" y="46" width="124" height="108" rx="16" fill="#2b3f3b" />
          <rect x="106" y="54" width="108" height="92" rx="10" fill="#f3ebdc" />
          {Array.from({ length: 16 }, (_, i) => (
            <rect
              key={i}
              x={114 + (i % 8) * 11}
              y={60 + Math.floor(i / 8) * 34 + (i % 3) * 4}
              width="9"
              height={44 - (i % 4) * 4}
              rx="3"
              fill={i % 3 ? '#efbf4f' : '#e3a83a'}
              transform={`rotate(${((i * 23) % 40) - 20} ${118 + (i % 8) * 11} ${80 + Math.floor(i / 8) * 34})`}
            />
          ))}
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={124 + i * 8} cy={88 + ((i * 17) % 30)} r="1.4" fill="#c8361f" />
          ))}
          <circle cx="252" cy="140" r="20" fill="#f6f1e8" />
          <circle cx="252" cy="140" r="14" fill="#efe2bf" />
        </>
      )
    case 'sandwich':
      return (
        <>
          <rect x="72" y="40" width="176" height="120" rx="14" fill="#b88456" />
          <path d="M78 64h164M78 92h164M78 120h164" stroke="#a87346" strokeWidth="1.5" opacity=".6" />
          <path d="M96 140l40-86 40 86Z" fill="#c98c45" />
          <path d="M104 134l32-70 32 70Z" fill="#e6b468" />
          <path d="M106 138c10 6 20-6 30 2s20-4 30 0" stroke="#f2c84b" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M150 60l70 10-36 74Z" fill="#c98c45" />
          <path d="M158 66l54 8-28 58Z" fill="#e6b468" />
          {[[124, 104], [142, 116], [178, 90], [194, 100]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y}h14`} stroke="#b8732f" strokeWidth="3" strokeLinecap="round" opacity=".55" />
          ))}
          <circle cx="226" cy="134" r="5" fill="#c8361f" />
        </>
      )
    case 'crumble':
      return (
        <>
          <Plate r={78} />
          <circle cx="156" cy="100" r="54" fill="#e9e2d6" />
          <circle cx="156" cy="100" r="46" fill="#c8904d" />
          {Array.from({ length: 30 }, (_, i) => (
            <circle
              key={i}
              cx={156 + Math.cos(i * 2.39) * Math.sqrt(i) * 7.8}
              cy={100 + Math.sin(i * 2.39) * Math.sqrt(i) * 7.8}
              r={3 + (i % 3)}
              fill={i % 2 ? '#b07738' : '#d9a868'}
            />
          ))}
          <path d="M162 86c10-8 26-4 26 6s-16 14-26 8-8-10 0-14Z" fill="#fbf6ec" />
          <path d="M216 142a16 16 0 0 1 22-22" stroke="#9e2b25" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M220 140a12 12 0 0 1 16-16" stroke="#f4e4b9" strokeWidth="5" fill="none" />
        </>
      )
    case 'brownie':
      return (
        <>
          <Plate />
          <rect x="120" y="62" width="80" height="76" rx="8" fill="#4a2a1e" transform="rotate(-6 160 100)" />
          <path d="M132 80l20 10 14-8 22 12M136 112l18-6 16 10 18-8" stroke="#6a4030" strokeWidth="2" fill="none" transform="rotate(-6 160 100)" />
          {[[144, 90], [176, 82], [168, 118], [140, 120]].map(([x, y], i) => (
            <path
              key={i}
              d={`M${x} ${y}c4-6 12-6 14 0s-2 10-8 10-8-4-6-10Z`}
              fill="#c8945b"
            />
          ))}
          {Array.from({ length: 22 }, (_, i) => (
            <circle key={i} cx={124 + ((i * 37) % 76)} cy={64 + ((i * 53) % 72)} r="1.3" fill="#fff" opacity=".7" />
          ))}
        </>
      )
    case 'cake':
      return (
        <>
          <Plate />
          <path d="M112 132L160 50l52 82Z" fill="#c7854a" />
          <path d="M118 128L160 58l46 70Z" fill="#f3eadb" />
          {[[150, 92], [168, 104], [158, 114], [176, 120], [142, 118]].map(([x, y], i) => (
            <path key={i} d={`M${x} ${y}l7 -3`} stroke="#e0662c" strokeWidth="2.4" strokeLinecap="round" />
          ))}
          <path d="M156 78c4-6 12-6 14 0s-2 10-8 10-8-4-6-10Z" fill="#a8743f" />
          <path d="M216 72l24 76M226 70l4 14M234 68l4 14M242 66l4 14" stroke="#cfc6b8" strokeWidth="4" strokeLinecap="round" />
        </>
      )
  }
}
