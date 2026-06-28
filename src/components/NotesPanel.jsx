import { useEffect, useRef, useState } from 'react'
import { getNotes, saveNotes } from '../lib/db'
import { useSettings } from '../store/useSettings'
import { IconClose, IconCopy, IconCheck, IconNote } from './icons.jsx'

const MIN_W = 300
const MIN_H = 240

/* Encres cosy. La couleur réelle s'adapte au thème via les classes .ink-*
   (cf. app.css) — la pastille ci-dessous n'est qu'un aperçu. */
const INKS = [
  { cls: 'ink-default', color: 'var(--text)', name: 'Défaut' },
  { cls: 'ink-amber', color: '#d8a657', name: 'Ambre' },
  { cls: 'ink-rust', color: '#d6916a', name: 'Rouille' },
  { cls: 'ink-coral', color: '#e0897e', name: 'Corail' },
  { cls: 'ink-rose', color: '#d49ab4', name: 'Rose' },
  { cls: 'ink-plum', color: '#c2a0d8', name: 'Prune' },
  { cls: 'ink-lavender', color: '#a9aee0', name: 'Lavande' },
  { cls: 'ink-blue', color: '#8fb6df', name: 'Bleu' },
  { cls: 'ink-teal', color: '#7ec9c0', name: 'Sarcelle' },
  { cls: 'ink-sage', color: '#9cc0a0', name: 'Sauge' },
  { cls: 'ink-moss', color: '#bcc081', name: 'Mousse' },
]

export default function NotesPanel({ docId, docTitle, onClose, getCurrent, onGoTo }) {
  const [status, setStatus] = useState('')
  const [words, setWords] = useState(0)
  const [copied, setCopied] = useState(false)
  const edRef = useRef(null)
  const saveTimer = useRef(null)
  const loaded = useRef(false)

  // --- Géométrie de la fenêtre (déplaçable + redimensionnable) ---
  const saved = useSettings((s) => s.notesWin)
  const setNotesWin = useSettings((s) => s.setNotesWin)
  const [rect, setRect] = useState(() => {
    const w = saved.w || 360
    const h = saved.h || 460
    return {
      w,
      h,
      x: saved.x ?? Math.max(16, window.innerWidth - w - 28),
      y: saved.y ?? 76,
    }
  })
  const drag = useRef(null)

  function clamp(r) {
    const w = Math.min(Math.max(r.w, MIN_W), window.innerWidth - 16)
    const h = Math.min(Math.max(r.h, MIN_H), window.innerHeight - 16)
    return {
      w,
      h,
      x: Math.min(Math.max(r.x, 0), window.innerWidth - w),
      y: Math.min(Math.max(r.y, 0), window.innerHeight - 44),
    }
  }

  function startMove(e) {
    if (e.target.closest('.icon-btn')) return
    e.preventDefault()
    drag.current = { mode: 'move', sx: e.clientX, sy: e.clientY, ...rect }
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.classList.add('dragging-win')
  }
  function startResize(e) {
    e.preventDefault()
    e.stopPropagation()
    drag.current = { mode: 'resize', sx: e.clientX, sy: e.clientY, ...rect }
    e.currentTarget.setPointerCapture(e.pointerId)
    document.body.classList.add('dragging-win')
  }
  function onPointerMove(e) {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.sx
    const dy = e.clientY - d.sy
    if (d.mode === 'move') setRect(clamp({ ...rect, x: d.x + dx, y: d.y + dy }))
    else setRect(clamp({ ...rect, w: d.w + dx, h: d.h + dy }))
  }
  function endDrag() {
    if (!drag.current) return
    drag.current = null
    document.body.classList.remove('dragging-win')
    setNotesWin(rect)
  }

  useEffect(() => {
    getNotes(docId).then((html) => {
      if (edRef.current) edRef.current.innerHTML = html || ''
      loaded.current = true
      updateCount()
      requestAnimationFrame(() => edRef.current?.focus())
    })
    return () => {
      if (loaded.current && edRef.current) saveNotes(docId, edRef.current.innerHTML)
    }
  }, [docId])

  function updateCount() {
    const t = edRef.current?.innerText.trim() || ''
    setWords(t ? t.split(/\s+/).length : 0)
  }

  function scheduleSave() {
    setStatus('saving')
    updateCount()
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      await saveNotes(docId, edRef.current?.innerHTML || '')
      setStatus('saved')
      setTimeout(() => setStatus(''), 1400)
    }, 450)
  }

  function applyInk(cls) {
    const ed = edRef.current
    ed.focus()
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return
    const range = sel.getRangeAt(0)
    if (!ed.contains(range.commonAncestorContainer)) return
    const span = document.createElement('span')
    span.className = 'ink ' + cls
    try {
      span.appendChild(range.extractContents())
      range.insertNode(span)
      sel.removeAllRanges()
      const after = document.createRange()
      after.setStartAfter(span)
      after.collapse(true)
      sel.addRange(after)
    } catch {}
    scheduleSave()
  }

  function insertPageLink() {
    const cur = getCurrent?.()
    if (!cur) return
    const pos = cur.position || {}
    let lbl
    if (pos.page) lbl = 'p.' + pos.page
    else if (typeof pos.scroll === 'number') lbl = Math.round(pos.scroll * 100) + '%'
    else lbl = cur.label || 'position'

    const ed = edRef.current
    ed.focus()
    const chip = document.createElement('a')
    chip.className = 'note-link'
    chip.contentEditable = 'false'
    chip.setAttribute('data-pos', JSON.stringify(pos))
    chip.textContent = '↪ ' + lbl
    const space = document.createTextNode(' ')

    const sel = window.getSelection()
    if (sel && sel.rangeCount && ed.contains(sel.getRangeAt(0).commonAncestorContainer)) {
      const range = sel.getRangeAt(0)
      range.collapse(false)
      range.insertNode(space)
      range.insertNode(chip)
      const r2 = document.createRange()
      r2.setStartAfter(space)
      r2.collapse(true)
      sel.removeAllRanges()
      sel.addRange(r2)
    } else {
      ed.appendChild(chip)
      ed.appendChild(space)
    }
    scheduleSave()
  }

  function onEditorClick(e) {
    const link = e.target.closest?.('.note-link')
    if (link) {
      e.preventDefault()
      try {
        onGoTo?.(JSON.parse(link.getAttribute('data-pos')))
      } catch {}
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(edRef.current?.innerText || '')
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <aside
      className="notes-window fade-in"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    >
      <div
        className="notes-winbar"
        onPointerDown={startMove}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div className="notes-head-title">
          <span className="notes-grip" aria-hidden>
            ⠿
          </span>
          <div>
            <h3>Mes notes</h3>
            <span className="notes-doc">{docTitle}</span>
          </div>
        </div>
        <button className="icon-btn" onClick={onClose} title="Fermer (N)">
          <IconClose />
        </button>
      </div>

      <div className="notes-tools">
        <div className="ink-swatches">
          {INKS.map((ink) => (
            <button
              key={ink.cls}
              className={`ink-swatch ${ink.cls === 'ink-default' ? 'is-default' : ''}`}
              style={{ '--sw': ink.color }}
              onMouseDown={(e) => {
                e.preventDefault() // garde la sélection du texte
                applyInk(ink.cls)
              }}
              title={ink.name}
            />
          ))}
        </div>
        <button
          className="btn btn-ghost note-link-btn"
          onMouseDown={(e) => {
            e.preventDefault()
            insertPageLink()
          }}
          title="Insérer un lien vers la page actuelle"
        >
          <IconNote size={15} /> Lier la page
        </button>
      </div>

      <div
        ref={edRef}
        className="notes-area"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        onInput={scheduleSave}
        onClick={onEditorClick}
        data-placeholder="Écris ce que tu veux ici — idées, citations, questions… Sélectionne du texte pour le colorer, et « Lier la page » pour pointer vers l'endroit où tu lis."
      />

      <div className="notes-foot">
        <span className="notes-status">
          {status === 'saving'
            ? 'Enregistrement…'
            : status === 'saved'
            ? '✓ Enregistré'
            : `${words} mot${words > 1 ? 's' : ''}`}
        </span>
        <button className="btn" onClick={copy} disabled={!words}>
          {copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
          {copied ? 'Copié' : 'Copier'}
        </button>
      </div>

      <div
        className="notes-resize"
        onPointerDown={startResize}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        title="Redimensionner"
      />
    </aside>
  )
}
