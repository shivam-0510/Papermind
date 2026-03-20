import React from 'react'
import { useTheme } from './context/ThemeContext'

interface LogoProps {
  size?: number
}

/**
 * PaperMind logo — a document with folded top-right corner
 * and an AI "spark" lens in the bottom-right corner.
 * Automatically adapts accent and surface colors for light/dark mode.
 */
export default function Logo({ size = 30 }: LogoProps) {
  const { isDark } = useTheme()

  const accent      = isDark ? '#d4734a' : '#c96442'
  const accentDeep  = isDark ? '#b05a35' : '#9d4e32'
  const sparkBg     = isDark ? '#262626' : '#fff7f2'
  const sparkRing   = isDark ? '#333'    : '#fde8dc'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="PaperMind logo"
    >
      {/* ── Document body ─────────────────────────────────────────── */}
      <path
        d="M5 5C5 3.343 6.343 2 8 2H19.5L27 9.5V27C27 28.657 25.657 30 24 30H8C6.343 30 5 28.657 5 27V5Z"
        fill={accent}
      />

      {/* ── Folded corner shadow ──────────────────────────────────── */}
      <path
        d="M19.5 2L27 9.5H23C21.067 9.5 19.5 7.933 19.5 6V2Z"
        fill={accentDeep}
      />

      {/* ── Page lines (text representation) ─────────────────────── */}
      <rect x="9"  y="13.5" width="11" height="1.5" rx="0.75" fill="white" opacity="0.85" />
      <rect x="9"  y="17.5" width="11" height="1.5" rx="0.75" fill="white" opacity="0.85" />
      <rect x="9"  y="21.5" width="7"  height="1.5" rx="0.75" fill="white" opacity="0.6"  />

      {/* ── AI spark lens (bottom-right) ──────────────────────────── */}
      {/* Outer glow ring */}
      <circle cx="22.5" cy="22.5" r="6.2" fill={sparkBg} />
      {/* Inner ring */}
      <circle cx="22.5" cy="22.5" r="4.2" fill={sparkRing} />

      {/* Brain / neural arc — top half circle */}
      <path
        d="M20.2 22.5 C20.2 21.172 21.172 20.2 22.5 20.2 C23.828 20.2 24.8 21.172 24.8 22.5"
        stroke={accent}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      {/* Stem down */}
      <line x1="22.5" y1="22.5" x2="22.5" y2="24.4"
        stroke={accent} strokeWidth="1.25" strokeLinecap="round" />
      {/* Base dot */}
      <circle cx="22.5" cy="24.9" r="0.65" fill={accent} />
    </svg>
  )
}