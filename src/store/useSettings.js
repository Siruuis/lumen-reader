import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FONTS } from '../lib/themes'

/* Réglages globaux d'apparence & de confort, persistés dans localStorage. */
export const useSettings = create(
  persist(
    (set) => ({
      theme: 'dusk',
      font: 'serif', // id dans FONTS
      fontSize: 19, // px
      lineHeight: 1.75,
      contentWidth: 720, // px
      letterSpacing: 0, // px
      warmth: 18, // 0-100 : filtre chaud anti lumière bleue
      brightness: 100, // 50-100 : assombrissement doux de l'écran
      focusMode: false, // masque la chrome de l'UI

      pdfZoom: 1, // facteur de zoom PDF (0.5 - 2.5)
      pdfSpread: false, // false = 1 page/ligne, true = 2 pages/ligne

      // Géométrie de la fenêtre de notes (null = position par défaut calculée)
      notesWin: { x: null, y: null, w: 360, h: 460 },
      setNotesWin: (patch) => set((s) => ({ notesWin: { ...s.notesWin, ...patch } })),

      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      set: (patch) => set(patch),
      toggleFocus: () => set((s) => ({ focusMode: !s.focusMode })),
      zoomIn: () => set((s) => ({ pdfZoom: Math.min(2.5, +(s.pdfZoom + 0.15).toFixed(2)) })),
      zoomOut: () => set((s) => ({ pdfZoom: Math.max(0.5, +(s.pdfZoom - 0.15).toFixed(2)) })),
      toggleSpread: () => set((s) => ({ pdfSpread: !s.pdfSpread })),
    }),
    { name: 'lumen:settings' }
  )
)

/* Applique le thème + les filtres de confort au document. */
export function applyTheme(s) {
  document.documentElement.setAttribute('data-theme', s.theme)
  document.documentElement.style.setProperty('--warmth', s.warmth)
  document.documentElement.style.setProperty('--brightness', s.brightness)
}

/* Variables CSS de lecture, à étaler en inline sur la surface de lecture. */
export function readerVars(s) {
  const font = FONTS.find((f) => f.id === s.font) || FONTS[0]
  return {
    '--reader-font-family': font.css,
    '--reader-font-size': `${s.fontSize}px`,
    '--reader-line-height': s.lineHeight,
    '--reader-width': `${s.contentWidth}px`,
    '--reader-letter': `${s.letterSpacing}px`,
  }
}
