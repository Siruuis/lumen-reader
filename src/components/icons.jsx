/* Petites icônes SVG (stroke = currentColor) */
const S = ({ children, size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
)

export const IconBack = (p) => (
  <S {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </S>
)
export const IconBookmark = (p) => (
  <S {...p}>
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </S>
)
export const IconBookmarkFill = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)
export const IconSettings = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </S>
)
export const IconFocus = (p) => (
  <S {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3" />
  </S>
)
export const IconPlus = (p) => (
  <S {...p}>
    <path d="M12 5v14M5 12h14" />
  </S>
)
export const IconTrash = (p) => (
  <S {...p}>
    <path d="M3 6h18M19 6l-.9 14a2 2 0 0 1-2 1.9H7.9a2 2 0 0 1-2-1.9L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </S>
)
export const IconList = (p) => (
  <S {...p}>
    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
  </S>
)
export const IconLink = (p) => (
  <S {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </S>
)
export const IconClose = (p) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
)
export const IconChevL = (p) => (
  <S {...p}>
    <path d="M15 18l-6-6 6-6" />
  </S>
)
export const IconChevR = (p) => (
  <S {...p}>
    <path d="M9 18l6-6-6-6" />
  </S>
)
export const IconMinus = (p) => (
  <S {...p}>
    <path d="M5 12h14" />
  </S>
)
export const IconZoomIn = (p) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
  </S>
)
export const IconZoomOut = (p) => (
  <S {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3M8 11h6" />
  </S>
)
export const IconSpread = (p) => (
  <S {...p}>
    <rect x="3" y="4" width="8" height="16" rx="1" />
    <rect x="13" y="4" width="8" height="16" rx="1" />
  </S>
)
export const IconSingle = (p) => (
  <S {...p}>
    <rect x="7" y="4" width="10" height="16" rx="1" />
  </S>
)
export const IconNote = (p) => (
  <S {...p}>
    <path d="M14 3v4a1 1 0 0 0 1 1h4" />
    <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M9 12h6M9 16h4" />
  </S>
)
export const IconCopy = (p) => (
  <S {...p}>
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </S>
)
export const IconCheck = (p) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
)
export const IconSun = (p) => (
  <S {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </S>
)
