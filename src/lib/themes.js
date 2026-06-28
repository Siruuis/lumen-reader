/* Définitions des thèmes pour l'UI de sélection.
   Les couleurs réelles vivent dans global.css ([data-theme=...]). */
export const THEMES = [
  {
    id: 'dusk',
    name: 'Crépuscule',
    hint: 'Sombre & chaud — le soir',
    swatch: ['#1c1916', '#d8a657', '#e6dcc8'],
    dark: true,
  },
  {
    id: 'ink',
    name: 'Encre',
    hint: 'Sombre & doux — repos maximal',
    swatch: ['#141414', '#9bb4a0', '#cfc9bf'],
    dark: true,
  },
  {
    id: 'midnight',
    name: 'Nuit',
    hint: 'Sombre & bleuté',
    swatch: ['#15181f', '#8fb3e0', '#d4dae6'],
    dark: true,
  },
  {
    id: 'sepia',
    name: 'Sépia',
    hint: 'Papier ancien — le jour',
    swatch: ['#ece3d2', '#a9762f', '#4a3f2f'],
    dark: false,
  },
  {
    id: 'cream',
    name: 'Crème',
    hint: 'Clair & neutre',
    swatch: ['#f4f1ea', '#b07d3e', '#2f2c27'],
    dark: false,
  },
]

export const FONTS = [
  { id: 'serif', name: 'Serif (Lora)', css: "'Lora', Georgia, serif" },
  { id: 'sans', name: 'Sans (Inter)', css: "'Inter', system-ui, sans-serif" },
  {
    id: 'legible',
    name: 'Lisible (Atkinson)',
    css: "'Atkinson Hyperlegible', sans-serif",
  },
]
