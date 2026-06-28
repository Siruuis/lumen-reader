import { useEffect, useRef, useState } from 'react'
import ePub from 'epubjs'
import { useSettings } from '../../store/useSettings'
import { THEMES, FONTS } from '../../lib/themes'

export default function EpubReader({ file, url, initialPos, onLocation, controllerRef }) {
  const settings = useSettings()
  const hostRef = useRef(null)
  const bookRef = useRef(null)
  const rendRef = useRef(null)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)
  const curCfi = useRef(initialPos?.cfi || null)
  const curChapter = useRef('')

  // Init du livre + rendition
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const data = file ? await file.arrayBuffer() : undefined
        const book = data ? ePub(data) : ePub(url)
        bookRef.current = book

        const rendition = book.renderTo(hostRef.current, {
          flow: 'scrolled',
          manager: 'continuous',
          width: '100%',
          height: '100%',
          allowScriptedContent: false,
        })
        rendRef.current = rendition

        applyEpubTheme(rendition, settings)
        await rendition.display(initialPos?.cfi || undefined)
        if (!alive) return
        setReady(true)

        // Génère les locations pour une progression fiable (en arrière-plan)
        book.ready
          .then(() => book.locations.generate(1600))
          .catch(() => {})

        // Table des matières pour libeller les marque-pages
        book.loaded.navigation.then((nav) => {
          rendition.on('relocated', (location) => {
            curCfi.current = location.start.cfi
            const href = location.start.href
            const item = nav.toc.find((t) => href && t.href.includes(href.split('#')[0]))
            curChapter.current = item?.label?.trim() || ''
            const pct =
              book.locations.length() > 0
                ? book.locations.percentageFromCfi(location.start.cfi)
                : location.start.percentage || 0
            onLocation({
              position: { cfi: location.start.cfi },
              progress: pct,
              label: curChapter.current || `${Math.round(pct * 100)} %`,
            })
          })
        })
      } catch (e) {
        console.error(e)
        setError(
          file
            ? "Impossible d'ouvrir cet EPUB."
            : "Impossible de charger cet EPUB depuis l'URL (CORS probable). Télécharge-le et glisse-le ici."
        )
      }
    })()
    return () => {
      alive = false
      try {
        rendRef.current?.destroy()
        bookRef.current?.destroy()
      } catch {}
    }
  }, [file, url])

  // Ré-applique le thème quand les réglages changent
  useEffect(() => {
    if (rendRef.current) applyEpubTheme(rendRef.current, settings)
  }, [
    settings.theme,
    settings.font,
    settings.fontSize,
    settings.lineHeight,
    settings.letterSpacing,
  ])

  // API exposée
  useEffect(() => {
    controllerRef.current = {
      goTo: (pos) => pos?.cfi && rendRef.current?.display(pos.cfi),
      prev: () => rendRef.current?.prev(),
      next: () => rendRef.current?.next(),
      getCurrent: () => ({
        position: { cfi: curCfi.current },
        label: curChapter.current || 'Marque-page',
        preview: curChapter.current ? '' : 'Position dans le livre',
      }),
    }
  }, [])

  if (error) return <div className="reader-error">{error}</div>

  return (
    <div className="epub-wrap" style={{ maxWidth: 'var(--reader-width)' }}>
      {!ready && (
        <div className="reader-loading abs">
          <div className="spinner" />
          <p>Ouverture du livre…</p>
        </div>
      )}
      <div ref={hostRef} className="epub-host" />
    </div>
  )
}

function cssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return v || fallback
}

function applyEpubTheme(rendition, s) {
  const theme = THEMES.find((t) => t.id === s.theme)
  const bg = cssVar('--bg', theme?.swatch[0] || '#1c1916')
  const text = cssVar('--text', theme?.swatch[2] || '#e6dcc8')
  const accent = cssVar('--accent', '#d8a657')
  const font = FONTS.find((f) => f.id === s.font)?.css || FONTS[0].css

  rendition.themes.default({
    body: {
      background: `${bg} !important`,
      color: `${text} !important`,
      'font-family': `${font} !important`,
      'font-size': `${s.fontSize}px !important`,
      'line-height': `${s.lineHeight} !important`,
      'letter-spacing': `${s.letterSpacing}px !important`,
      padding: '8px 4px 40px !important',
    },
    p: { color: `${text} !important`, 'text-align': 'justify !important' },
    'h1, h2, h3, h4, h5, h6': { color: `${text} !important` },
    a: { color: `${accent} !important` },
    img: { 'max-width': '100% !important', 'border-radius': '6px' },
    '::selection': { background: `${accent}55` },
  })
}
