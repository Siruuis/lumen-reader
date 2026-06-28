import { useState } from 'react'
import { useT } from '../lib/i18n'
import { IconClose, IconTrash, IconPlus, IconBookmarkFill } from './icons.jsx'

function BookmarkRow({ bm, onGo, onUpdate, onDelete }) {
  const t = useT()
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(bm.label)
  const [note, setNote] = useState(bm.note || '')

  function save() {
    onUpdate(bm.id, { label: label.trim() || t('bm.defaultLabel'), note })
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
            placeholder={t('bm.namePlaceholder')}
            autoFocus
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('bm.notePlaceholder')}
            rows={2}
          />
          <div className="bm-edit-actions">
            <button className="btn btn-ghost" onClick={() => setEditing(false)}>
              {t('common.cancel')}
            </button>
            <button className="btn btn-accent" onClick={save}>
              {t('common.save')}
            </button>
          </div>
        </div>
      ) : (
        <div className="bm-actions">
          <button className="icon-btn sm" onClick={() => setEditing(true)} title={t('bm.editTitle')}>
            ✎
          </button>
          <button className="icon-btn sm" onClick={() => onDelete(bm.id)} title={t('bm.deleteTitle')}>
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
  const t = useT()
  const sorted = [...bookmarks].sort((a, b) => b.createdAt - a.createdAt)

  return (
    <>
      <div className="scrim" onClick={onClose} />
      <aside className="panel panel-right fade-in">
        <div className="panel-head">
          <h3>{t('bm.title')}</h3>
          <button className="icon-btn" onClick={onClose}>
            <IconClose />
          </button>
        </div>

        <div className="panel-body">
          <button className="btn btn-accent full" onClick={onAdd}>
            <IconPlus size={16} /> {t('bm.markCurrent')}
          </button>

          {sorted.length === 0 ? (
            <p className="empty sm">
              {t('bm.emptyBefore')} <kbd>B</kbd>
              {t('bm.emptyAfter')}
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
