import { useEffect, useState } from 'react'
import { useT } from '../lib/i18n'

/* Bannière de mise à jour : écoute les événements de l'updater Electron
   (via window.lumenUpdater exposé par le preload). En dev navigateur,
   window.lumenUpdater est absent → la bannière ne s'affiche jamais. */
export default function UpdateBanner() {
  const t = useT()
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
          <span className="upd-text">{t('upd.updating')}</span>
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
            {t('upd.ready', { v: status.version ? `v${status.version}` : '' })}
          </span>
          <span className="upd-sub">{t('upd.readySub')}</span>
        </div>
        <button className="btn btn-accent upd-btn" onClick={() => window.lumenUpdater.restart()}>
          {t('upd.restart')}
        </button>
        <button className="upd-close" onClick={() => setDismissed(true)} title={t('upd.later')}>
          ✕
        </button>
      </div>
    )
  }

  return null
}
