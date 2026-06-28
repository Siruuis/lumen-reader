import {
  IconBack,
  IconBookmark,
  IconList,
  IconSettings,
  IconFocus,
  IconChevL,
  IconChevR,
  IconNote,
} from './icons.jsx'

export default function Toolbar({
  doc,
  progress,
  focusMode,
  onBack,
  onToggleFocus,
  onAddBookmark,
  onOpenBookmarks,
  onOpenNotes,
  onOpenSettings,
  bookmarkCount,
  onPrev,
  onNext,
  hasPaging,
}) {
  return (
    <header className={`toolbar ${focusMode ? 'auto-hide' : ''}`}>
      <div className="tb-left">
        <button className="icon-btn" onClick={onBack} title="Bibliothèque (Échap)">
          <IconBack />
        </button>
        <span className="tb-title" title={doc.title}>
          {doc.title}
        </span>
      </div>

      <div className="tb-center">
        {hasPaging && (
          <>
            <button className="icon-btn" onClick={onPrev} title="Précédent">
              <IconChevL />
            </button>
            <span className="tb-progress">{Math.round((progress || 0) * 100)}%</span>
            <button className="icon-btn" onClick={onNext} title="Suivant">
              <IconChevR />
            </button>
          </>
        )}
        {!hasPaging && (
          <span className="tb-progress">{Math.round((progress || 0) * 100)}%</span>
        )}
      </div>

      <div className="tb-right">
        <button
          className="icon-btn"
          onClick={onAddBookmark}
          title="Ajouter un marque-page (B)"
        >
          <IconBookmark />
        </button>
        <button
          className="icon-btn"
          onClick={onOpenBookmarks}
          title="Mes marque-pages"
        >
          <IconList />
          {bookmarkCount > 0 && <span className="dot">{bookmarkCount}</span>}
        </button>
        <button className="icon-btn" onClick={onOpenNotes} title="Bloc-notes (N)">
          <IconNote />
        </button>
        <button
          className={`icon-btn ${focusMode ? 'active' : ''}`}
          onClick={onToggleFocus}
          title="Mode focus (F)"
        >
          <IconFocus />
        </button>
        <button className="icon-btn" onClick={onOpenSettings} title="Apparence">
          <IconSettings />
        </button>
      </div>

      <div className="tb-progressbar">
        <div className="tb-progressbar-fill" style={{ width: `${(progress || 0) * 100}%` }} />
      </div>
    </header>
  )
}
