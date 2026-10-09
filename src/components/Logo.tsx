import { cafe } from '../data/cafe'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="logo">
      <svg className="logo__mark" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M3 25 13 9l5 7 3.5-4.5L29 25Z" fill="currentColor" />
        <path d="m13 9 2.8 3.9-2.3 1.7-1.9-1.8-2.3 2Z" fill="var(--saffron)" />
      </svg>
      {!compact && <span className="logo__word">{cafe.name}</span>}
    </span>
  )
}
