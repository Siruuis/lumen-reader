import { useState } from 'react'
import { IconClose, IconTrash, IconPlus, IconBookmarkFill } from './icons.jsx'

function BookmarkRow({ bm, onGo, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(bm.label)
  const [note, setNote] = useState(bm.note || '')

  function save() {
    onUpdate(bm.id, { label: label.trim() || 'Marque-page', note })
    setEditing(false)
  }

  return (
    <div className="bm-row">
      <button className="bm-main" onClick={() => onGo(bm)}>
        <span className="bm-mark">
          <IconBookmarkFill size={16} />
        </span>
        <span className="bm-text">
          <span className="bm-label">{bm.label}</span>
          {bm.preview && <span className="bm-preview">{bm.preview}</span>}
          {bm.note && <span className="bm-note">📝 {bm.note}</span>}
        </span>
      </button>

      {editing ? (
        <div className="bm-edit">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nom du marque-page"
            autoFocus
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Une note (optionnel)…"
            rows={2}
          />
          <div className="bm-edit-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button className="btn btn-accent" onClick={save}>
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <div className="bm-actions">
          <button className="icon-btn sm" onClick={() => setEditing(true)} title="Renommer / noter">
            ✎
          </button>
          <button className="icon-btn sm" onClick={() => onDelete(bm.id)} title="Supprimer">
            <IconTrash size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function BookmarksPanel({
  bookmarks,
  onGo,
  onUpdate,
  onDelete,
  onAdd,
  onClose,
}) {
  const sorted = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel panel-right fade-in">
        <div className="panel-head">
          <h3>Marque-pages</h3>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="panel-body">
          <button className="btn btn-accent full" onClick={onAdd}>
            <IconPlus size={16} /> Marquer la position actuelle
          </button>

          {sorted.length === 0 ? (
            <p className="empty sm">
              Aucun marque-page. Clique sur l'icône signet (ou appuie sur{' '}
              <kbd>B</kbd>) pour garder ta place.
            </p>
          ) : (
            <div className="bm-list">
              {sorted.map((bm) => (
                <BookmarkRow
                  key={bm.id}
                  bm={bm}
                  onGo={onGo}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
