import { useEffect, useRef, useState, useCallback } from 'react'
import {
  getDoc,
  getFile,
  touchDoc,
  updateDoc,
  getPosition,
  savePosition,
  getBookmarks,
  addBookmark,
  updateBookmark,
  deleteBookmark,
} from '../lib/db'
import { useSettings, readerVars } from '../store/useSettings'
import { useT } from '../lib/i18n'
import Toolbar from './Toolbar.jsx'
import BookmarksPanel from './BookmarksPanel.jsx'
import SettingsPanel from './SettingsPanel.jsx'
import NotesPanel from './NotesPanel.jsx'
import PdfReader from './readers/PdfReader.jsx'
import EpubReader from './readers/EpubReader.jsx'
import WebReader from './readers/WebReader.jsx'

export default function Reader({ docId, onBack }) {
  const settings = useSettings()
  const t = useT()
  const [doc, setDoc] = useState(null)
  const [file, setFile] = useState(null)
  const [initialPos, setInitialPos] = useState(undefined)
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarks, setShowBookmarks] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [progress, setProgress] = useState(0)
  const [pageLabel, setPageLabel] = useState('')
  const [toast, setToast] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const ctrl = useRef(null) // API exposée par le lecteur enfant
  const lastSave = useRef(0)

  // Chargement initial du document.
  useEffect(() => {
    let alive = true
    ;(async () => {
      const d = await getDoc(docId)
      if (!alive) return
      setDoc(d)
      if (d?.source === 'file') {
        const f = await getFile(docId)
        if (alive) setFile(f)
      }
      const pos = await getPosition(docId)
      if (alive) {
        setInitialPos(pos)
        setProgress(d?.progress || 0)
        setBookmarks(await getBookmarks(docId))
        setLoaded(true)
        touchDoc(docId)
      }
    })()
    return () => {
      alive = false
    }
  }, [docId])

  // Reçu en continu du lecteur enfant : sauvegarde position + progression.
  const onLocation = useCallback(
    ({ position, progress: p, label }) => {
      if (typeof p === 'number') setProgress(p)
      if (label) setPageLabel(label)
      const now = Date.now()
      if (now - lastSave.current > 700) {
        lastSave.current = now
        savePosition(docId, position)
        if (typeof p === 'number') updateDoc(docId, { progress: p })
      }
    },
    [docId]
  )

  const flashToast = (msg) => {
    setToast(msg)
    clearTimeout(flashToast._t)
    flashToast._t = setTimeout(() => setToast(null), 2200)
  }

  async function handleAddBookmark() {
    const cur = ctrl.current?.getCurrent?.()
    if (!cur) return
    const bm = await addBookmark(docId, {
      label: cur.label || t('bm.defaultLabel'),
      preview: cur.preview || '',
      note: '',
      position: cur.position,
    })
    setBookmarks(await getBookmarks(docId))
    setShowBookmarks(true)
    flashToast(t('reader.bookmarkAdded'))
    return bm
  }

  async function handleUpdateBookmark(bmId, patch) {
    await updateBookmark(docId, bmId, patch)
    setBookmarks(await getBookmarks(docId))
  }

  async function handleDeleteBookmark(bmId) {
    await deleteBookmark(docId, bmId)
    setBookmarks(await getBookmarks(docId))
  }

  function goToBookmark(bm) {
    ctrl.current?.goTo?.(bm.position)
    setShowBookmarks(false)
  }

  // Raccourcis clavier
  useEffect(() => {
    function onKey(e) {
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      )
        return
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault()
        handleAddBookmark()
      } else if (e.key === 'f' || e.key === 'F') {
        settings.toggleFocus()
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        setShowNotes((v) => !v)
      } else if (e.key === 'Escape') {
        if (settings.focusMode) settings.toggleFocus()
        else onBack()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [settings.focusMode])

  if (!loaded || !doc) {
    return (
      <div className="reader-loading">
        <div className="spinner" />
        <p>{t('reader.opening')}</p>
      </div>
    )
  }

  const commonProps = {
    doc,
    file,
    url: doc.url,
    initialPos,
    onLocation,
    controllerRef: ctrl,
  }

  return (
    <div
      className={`reader ${settings.focusMode ? 'focus' : ''}`}
      style={readerVars(settings)}
    >
      <Toolbar
        doc={doc}
        progress={progress}
        focusMode={settings.focusMode}
        onBack={onBack}
        onToggleFocus={settings.toggleFocus}
        onAddBookmark={handleAddBookmark}
        onOpenBookmarks={() => setShowBookmarks(true)}
        onOpenNotes={() => setShowNotes(true)}
        onOpenSettings={() => setShowSettings(true)}
        bookmarkCount={bookmarks.length}
        onPrev={() => ctrl.current?.prev?.()}
        onNext={() => ctrl.current?.next?.()}
        hasPaging={doc.type !== 'web'}
      />

      <main className="reader-stage">
        {doc.type === 'pdf' && <PdfReader {...commonProps} />}
        {doc.type === 'epub' && <EpubReader {...commonProps} />}
        {doc.type === 'web' && <WebReader {...commonProps} />}
      </main>

      {pageLabel && !showBookmarks && !showSettings && !showNotes && (
        <div className="page-pill">{pageLabel}</div>
      )}

      {showBookmarks && (
        <BookmarksPanel
          bookmarks={bookmarks}
          onGo={goToBookmark}
          onUpdate={handleUpdateBookmark}
          onDelete={handleDeleteBookmark}
          onAdd={handleAddBookmark}
          onClose={() => setShowBookmarks(false)}
        />
      )}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showNotes && (
        <NotesPanel
          docId={docId}
          docTitle={doc.title}
          onClose={() => setShowNotes(false)}
          getCurrent={() => ctrl.current?.getCurrent?.()}
          onGoTo={(pos) => ctrl.current?.goTo?.(pos)}
        />
      )}

      {toast && <div className="toast fade-in">{toast}</div>}
    </div>
  )
}
