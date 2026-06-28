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
import SettingsPanel from './SettingsPanel.jsx'
import {
  IconPlus,
  IconLink,
  IconTrash,
  IconSettings,
} from './icons.jsx'

const TYPE_LABEL = { pdf: 'PDF', epub: 'EPUB', web: 'Article' }

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
  const greeting =
    hour < 6
      ? 'Bonne nuit'
      : hour < 12
      ? 'Bonjour'
      : hour < 18
      ? 'Bel après-midi'
      : 'Bonsoir'
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
          title="Apparence & confort"
        >
          <IconSettings />
        </button>
      </header>

      <section className="hero-grid">
        <div className="hero-left">
          <p className="hero-eyebrow">Ton coin lecture</p>
          <h1 className="hero-title">
            {greeting}.
            <br />
            <span className="hero-accent">Pose-toi et lis.</span>
          </h1>
          <p className="hero-sub">
            PDF, livres et articles - doux pour les yeux, sans distraction. Tout
            reste sur ta machine.
          </p>

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
                <span className="resume-kicker">Reprendre la lecture</span>
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
            <p className="dz-title">Dépose un PDF ou un EPUB</p>
            <p className="dz-sub">ou clique pour choisir</p>
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
            <span>ou colle un lien</span>
          </div>

          <form className="url-bar" onSubmit={handleAddUrl}>
            <IconLink size={18} />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="PDF, EPUB ou article web…"
            />
            <button type="submit" className="btn btn-accent" disabled={!url.trim()}>
              Ouvrir
            </button>
          </form>
        </div>
      </section>

      <section className="shelf">
        <h2>Ma bibliothèque {docs.length > 0 && <span>· {docs.length}</span>}</h2>
        {docs.length === 0 ? (
          <p className="empty">
            Rien encore. Ajoute ton premier document pour commencer à lire ✨
          </p>
        ) : (
          <div className="grid">
            {docs.map((d) => (
              <button
                key={d.id}
                className="card fade-in"
                onClick={() => onOpen(d.id)}
              >
                <div className={`cover cover-${d.type} ${d.cover ? 'has-img' : ''}`}>
                  <span className="badge">{TYPE_LABEL[d.type] || d.type}</span>
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
                    {Math.round((d.progress || 0) * 100)}% lu
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
                  title="Retirer de la bibliothèque"
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
            <h3>Retirer ce document ?</h3>
            <p>
              « {confirmDoc.title} » sera retiré de ta bibliothèque, avec ses
              marque-pages, notes et position de lecture. Le fichier d'origine
              sur ton disque n'est pas touché.
            </p>
            <div className="confirm-actions">
              <button className="btn" onClick={() => setConfirmDoc(null)}>
                Annuler
              </button>
              <button className="btn btn-danger" onClick={confirmRemove}>
                <IconTrash size={15} /> Retirer
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
