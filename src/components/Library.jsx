import { useEffect, useRef, useState } from 'react'
import {
  listDocs,
  addFileDoc,
  addUrlDoc,
  deleteDoc,
  updateDoc,
  getFile,
} from '../lib/db'
import { generateCover } from '../lib/cover'
import { useSettings } from '../store/useSettings'
import { useT } from '../lib/i18n'
import SettingsPanel from './SettingsPanel.jsx'
import {
  IconPlus,
  IconLink,
  IconTrash,
  IconSettings,
} from './icons.jsx'

function detectType(url) {
  const clean = url.split('?')[0].toLowerCase()
  if (clean.endsWith('.pdf')) return 'pdf'
  if (clean.endsWith('.epub')) return 'epub'
  return 'web'
}

export default function Library({ onOpen }) {
  const [docs, setDocs] = useState([])
  const [dragging, setDragging] = useState(false)
  const [url, setUrl] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [confirmDoc, setConfirmDoc] = useState(null)
  const fileInput = useRef(null)
  const coverTried = useRef(new Set())
  const focusMode = useSettings((s) => s.focusMode)
  const t = useT()

  const refresh = () => listDocs().then(setDocs)
  useEffect(() => {
    refresh()
  }, [])

  // Génère les couvertures manquantes (PDF/EPUB importés) en arrière-plan
  useEffect(() => {
    docs.forEach(async (d) => {
      if (
        d.cover ||
        d.source !== 'file' ||
        (d.type !== 'pdf' && d.type !== 'epub') ||
        coverTried.current.has(d.id)
      )
        return
      coverTried.current.add(d.id)
      const file = await getFile(d.id)
      const cover = await generateCover(d, file)
      if (cover) {
        await updateDoc(d.id, { cover })
        refresh()
      }
    })
  }, [docs])

  const hour = new Date().getHours()
  const greetingKey =
    hour < 6
      ? 'lib.greeting.night'
      : hour < 12
      ? 'lib.greeting.morning'
      : hour < 18
      ? 'lib.greeting.afternoon'
      : 'lib.greeting.evening'
  const featured = docs.find((d) => (d.progress || 0) > 0.01 && (d.progress || 0) < 0.99)

  async function handleFiles(fileList) {
    const files = Array.from(fileList)
    for (const file of files) {
      const ext = file.name.toLowerCase()
      const type = ext.endsWith('.epub') ? 'epub' : ext.endsWith('.pdf') ? 'pdf' : null
      if (!type) continue
      const doc = await addFileDoc(file, type)
      // Génère la couverture sans bloquer l'affichage
      generateCover(doc, file).then((cover) => {
        coverTried.current.add(doc.id)
        if (cover) updateDoc(doc.id, { cover }).then(refresh)
      })
    }
    refresh()
  }

  async function handleAddUrl(e) {
    e.preventDefault()
    const trimmed = url.trim()
    if (!trimmed) return
    const type = detectType(trimmed)
    const doc = await addUrlDoc(trimmed, type)
    setUrl('')
    refresh()
    onOpen(doc.id)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files)
  }

  function askRemove(e, doc) {
    e.stopPropagation()
    setConfirmDoc(doc)
  }

  async function confirmRemove() {
    if (!confirmDoc) return
    await deleteDoc(confirmDoc.id)
    coverTried.current.delete(confirmDoc.id)
    setConfirmDoc(null)
    refresh()
  }

  return (
    <div className="library">
      <header className="lib-header">
        <div className="brand">
          <span className="brand-mark">◐</span>
          <span className="brand-name">Lumen</span>
        </div>
        <button
          className="icon-btn"
          onClick={() => setShowSettings(true)}
          title={t('settings.title')}
        >
          <IconSettings />
        </button>
      </header>

      <section className="hero-grid">
        <div className="hero-left">
          <p className="hero-eyebrow">{t('lib.eyebrow')}</p>
          <h1 className="hero-title">
            {t(greetingKey)}.
            <br />
            <span className="hero-accent">{t('lib.heroAccent')}</span>
          </h1>
          <p className="hero-sub">{t('lib.heroSub')}</p>

          {featured && (
            <button className="resume fade-in" onClick={() => onOpen(featured.id)}>
              <div className={`resume-cover cover-${featured.type}`}>
                {featured.cover ? (
                  <img className="cover-img" src={featured.cover} alt="" />
                ) : (
                  <span className="cover-glyph">
                    {featured.type === 'web' ? '❡' : featured.type === 'epub' ? '❧' : '⊞'}
                  </span>
                )}
              </div>
              <div className="resume-body">
                <span className="resume-kicker">{t('lib.resume')}</span>
                <span className="resume-title">{featured.title}</span>
                <div className="resume-progress">
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.round((featured.progress || 0) * 100)}%` }}
                    />
                  </div>
                  <span>{Math.round((featured.progress || 0) * 100)}%</span>
                </div>
              </div>
              <span className="resume-go">▸</span>
            </button>
          )}
        </div>

        <div className="import-card">
          <div
            className={`dropzone ${dragging ? 'is-drag' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragging(true)
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInput.current?.click()}
          >
            <div className="dz-icon">
              <IconPlus size={24} />
            </div>
            <p className="dz-title">{t('lib.dzTitle')}</p>
            <p className="dz-sub">{t('lib.dzSub')}</p>
            <div className="dz-chips">
              <span>PDF</span>
              <span>EPUB</span>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              multiple
              hidden
              onChange={(e) => handleFiles(e.target.files)}
            />
          </div>

          <div className="import-or">
            <span>{t('lib.or')}</span>
          </div>

          <form className="url-bar" onSubmit={handleAddUrl}>
            <IconLink size={18} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('lib.urlPlaceholder')}
            />
            <button type="submit" className="btn btn-accent" disabled={!url.trim()}>
              {t('common.open')}
            </button>
          </form>
        </div>
      </section>

      <section className="shelf">
        <h2>
          {t('lib.shelf')} {docs.length > 0 && <span>· {docs.length}</span>}
        </h2>
        {docs.length === 0 ? (
          <p className="empty">{t('lib.empty')}</p>
        ) : (
          <div className="grid">
            {docs.map((d) => (
              <button
                key={d.id}
                className="card fade-in"
                onClick={() => onOpen(d.id)}
              >
                <div className={`cover cover-${d.type} ${d.cover ? 'has-img' : ''}`}>
                  <span className="badge">{t(`lib.type.${d.type}`)}</span>
                  {d.cover ? (
                    <img className="cover-img" src={d.cover} alt="" loading="lazy" />
                  ) : (
                    <span className="cover-glyph">
                      {d.type === 'web' ? '❡' : d.type === 'epub' ? '❧' : '⊞'}
                    </span>
                  )}
                </div>
                <div className="card-body">
                  <span className="card-title" title={d.title}>
                    {d.title}
                  </span>
                  <span className="card-meta">
                    {t('lib.read', { n: Math.round((d.progress || 0) * 100) })}
                  </span>
                  <div className="progress">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.round((d.progress || 0) * 100)}%` }}
                    />
                  </div>
                </div>
                <span
                  className="card-del"
                  onClick={(e) => askRemove(e, d)}
                  title={t('lib.removeTitle')}
                >
                  <IconTrash size={16} />
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

      {confirmDoc && (
        <>
          <div className="scrim" onClick={() => setConfirmDoc(null)} />
          <div className="confirm fade-in" role="dialog">
            <h3>{t('lib.confirmTitle')}</h3>
            <p>{t('lib.confirmBody', { title: confirmDoc.title })}</p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setConfirmDoc(null)}>
                {t('common.cancel')}
              </button>
              <button className="btn btn-danger" onClick={confirmRemove}>
                <IconTrash size={15} /> {t('common.remove')}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
