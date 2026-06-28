import { useEffect, useState } from 'react'

/* Bannière de mise à jour : écoute les événements de l'updater Electron
   (via window.lumenUpdater exposé par le preload). En dev navigateur,
   window.lumenUpdater est absent → la bannière ne s'affiche jamais. */
export default function UpdateBanner() {
  const [status, setStatus] = useState(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.lumenUpdater) return
    return window.lumenUpdater.onStatus((s) => {
      setStatus(s)
      if (s.state === 'available' || s.state === 'ready') setDismissed(false)
    })
  }, [])

  if (!status || dismissed) return null

  if (status.state === 'available' || status.state === 'downloading') {
    const pct = status.state === 'downloading' ? status.percent : 0
    return (
      <div className="update-banner fade-in">
        <span className="upd-spinner" />
        <div className="upd-body">
          <span className="upd-text">Mise à jour en cours…</span>
          <div className="upd-bar">
            <div className="upd-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
    )
  }

  if (status.state === 'ready') {
    return (
      <div className="update-banner ready fade-in">
        <span className="upd-dot" />
        <div className="upd-body">
          <span className="upd-text">
            Lumen {status.version ? `v${status.version}` : ''} est prête à installer.
          </span>
          <span className="upd-sub">Redémarre pour appliquer la mise à jour.</span>
        </div>
        <button className="btn btn-accent upd-btn" onClick={() => window.lumenUpdater.restart()}>
          Redémarrer
        </button>
        <button className="upd-close" onClick={() => setDismissed(true)} title="Plus tard">
          ✕
        </button>
      </div>
    )
  }

  return null
}
