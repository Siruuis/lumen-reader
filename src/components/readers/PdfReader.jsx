import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { useSettings } from '../../store/useSettings'
import { THEMES } from '../../lib/themes'
import {
  IconZoomIn,
  IconZoomOut,
  IconSpread,
  IconSingle,
} from '../icons.jsx'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const GAP = 24

/* Une page : ne rend son canvas qu'à l'approche du viewport, et re-rend
   uniquement quand l'échelle (zoom) change. */
function PdfPage({ pdf, pageNum, scale, width, height, isDark }) {
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const renderedScale = useRef(0)
  const taskRef = useRef(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisible(true),
      { root: el.closest('.pdf-scroll'), rootMargin: '900px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || renderedScale.current === scale) return
    let cancelled = false
    ;(async () => {
      const page = await pdf.getPage(pageNum)
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = viewport.width * dpr
      canvas.height = viewport.height * dpr
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      ctx.scale(dpr, dpr)
      try {
        taskRef.current?.cancel?.()
      } catch {}
      taskRef.current = page.render({ canvasContext: ctx, viewport })
      await taskRef.current.promise.catch(() => {})
      if (!cancelled) renderedScale.current = scale
    })()
    return () => {
      cancelled = true
    }
  }, [visible, scale])

  return (
    <div
      ref={wrapRef}
      className="pdf-page"
      data-page={pageNum}
      style={{ width, height }}
    >
      <canvas ref={canvasRef} className={isDark ? 'pdf-canvas inv' : 'pdf-canvas'} />
      {renderedScale.current === 0 && <span className="pdf-pagenum">{pageNum}</span>}
    </div>
  )
}

export default function PdfReader({ file, url, initialPos, onLocation, controllerRef }) {
  const theme = useSettings((s) => s.theme)
  const zoom = useSettings((s) => s.pdfZoom)
  const spread = useSettings((s) => s.pdfSpread)
  const zoomIn = useSettings((s) => s.zoomIn)
  const zoomOut = useSettings((s) => s.zoomOut)
  const toggleSpread = useSettings((s) => s.toggleSpread)
  const isDark = THEMES.find((t) => t.id === theme)?.dark

  const scrollRef = useRef(null)
  const [pdf, setPdf] = useState(null)
  const [base, setBase] = useState(null) // {w,h} à l'échelle 1
  const [numPages, setNumPages] = useState(0)
  const [containerW, setContainerW] = useState(800)
  const [error, setError] = useState(null)
  const [current, setCurrent] = useState(1)
  const didInit = useRef(false)

  const perRow = spread ? 2 : 1

  // Échelle dérivée : ajustement à la largeur (× nb colonnes) puis zoom
  const { scale, pageW, pageH } = useMemo(() => {
    if (!base) return { scale: 1, pageW: 0, pageH: 0 }
    const avail = containerW - 40 - (perRow - 1) * GAP
    const fit = Math.min(avail / perRow, spread ? 9999 : 900) / base.w
    const sc = fit * zoom
    return { scale: sc, pageW: base.w * sc, pageH: base.h * sc }
  }, [base, containerW, zoom, perRow, spread])

  const rowHeight = pageH + GAP

  // Chargement du PDF
  useEffect(() => {
    let task
    ;(async () => {
      try {
        const src = file ? { data: await file.arrayBuffer() } : { url }
        task = pdfjsLib.getDocument(src)
        const doc = await task.promise
        setPdf(doc)
        setNumPages(doc.numPages)
        const p1 = await doc.getPage(1)
        const vp1 = p1.getViewport({ scale: 1 })
        setBase({ w: vp1.width, h: vp1.height })
      } catch (e) {
        console.error(e)
        setError(
          file
            ? "Impossible d'ouvrir ce PDF (fichier corrompu ?)."
            : "Impossible de charger ce PDF depuis l'URL. Le site bloque peut-être l'accès direct (CORS). Télécharge-le puis glisse-le ici."
        )
      }
    })()
    return () => task?.destroy?.()
  }, [file, url])

  // Suivi de la largeur du conteneur (responsive + zoom adapté)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setContainerW(el.clientWidth))
    ro.observe(el)
    setContainerW(el.clientWidth)
    return () => ro.disconnect()
  }, [pdf])

  // Position initiale
  useEffect(() => {
    if (!pageH || didInit.current) return
    didInit.current = true
    const page = initialPos?.page || 1
    if (page > 1) requestAnimationFrame(() => scrollToPage(page))
  }, [pageH])

  const scrollToPage = useCallback(
    (page) => {
      if (!pageH || !scrollRef.current) return
      const row = Math.floor((page - 1) / perRow)
      scrollRef.current.scrollTo({ top: row * rowHeight, behavior: 'smooth' })
    },
    [pageH, rowHeight, perRow]
  )

  const onScroll = useCallback(() => {
    if (!pageH || !scrollRef.current) return
    const el = scrollRef.current
    const row = Math.max(0, Math.round(el.scrollTop / rowHeight))
    const page = Math.min(numPages, Math.max(1, row * perRow + 1))
    setCurrent(page)
    const progress = numPages > 1 ? (page - 1) / (numPages - 1) : 1
    onLocation({ position: { page }, progress, label: `${page} / ${numPages}` })
  }, [pageH, rowHeight, perRow, numPages, onLocation])

  useEffect(() => {
    controllerRef.current = {
      goTo: (pos) => scrollToPage(pos?.page || 1),
      prev: () => scrollToPage(Math.max(1, current - perRow)),
      next: () => scrollToPage(Math.min(numPages, current + perRow)),
      getCurrent: () => ({
        position: { page: current },
        label: `Page ${current}`,
        preview: `${numPages} pages au total`,
      }),
    }
  }, [current, numPages, scrollToPage, perRow])

  if (error) return <div className="reader-error">{error}</div>
  if (!pdf || !pageH)
    return (
      <div className="reader-loading">
        <div className="spinner" />
        <p>Chargement du PDF…</p>
      </div>
    )

  return (
    <>
      <div className="pdf-scroll" ref={scrollRef} onScroll={onScroll}>
        <div
          className={`pdf-pages ${spread ? 'spread' : ''}`}
          style={{
            gap: GAP,
            // En multipage, on borne le conteneur à 2 pages : jamais 3+ par ligne,
            // même très dézoomé (le box-sizing border-box inclut le padding latéral).
            maxWidth: spread ? 2 * pageW + GAP + 32 : undefined,
          }}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <PdfPage
              key={i + 1}
              pdf={pdf}
              pageNum={i + 1}
              scale={scale}
              width={pageW}
              height={pageH}
              isDark={isDark}
            />
          ))}
        </div>
      </div>

      <div className="pdf-controls">
        <button className="pdf-ctrl-btn" onClick={zoomOut} title="Dézoomer" disabled={zoom <= 0.5}>
          <IconZoomOut size={18} />
        </button>
        <span className="pdf-zoom-val">{Math.round(zoom * 100)}%</span>
        <button className="pdf-ctrl-btn" onClick={zoomIn} title="Zoomer" disabled={zoom >= 2.5}>
          <IconZoomIn size={18} />
        </button>
        <span className="pdf-ctrl-sep" />
        <button
          className="pdf-ctrl-btn"
          onClick={toggleSpread}
          title={spread ? 'Une page par ligne' : 'Deux pages par ligne'}
        >
          {spread ? <IconSingle size={18} /> : <IconSpread size={18} />}
        </button>
      </div>
    </>
  )
}
