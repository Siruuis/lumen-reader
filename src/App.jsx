import { useEffect, useState } from 'react'
import { useSettings, applyTheme } from './store/useSettings'
import { useLang } from './lib/i18n'
import Library from './components/Library.jsx'
import Reader from './components/Reader.jsx'
import UpdateBanner from './components/UpdateBanner.jsx'

export default function App() {
  const settings = useSettings()
  const lang = useLang()
  const [route, setRoute] = useState({ view: 'library', docId: null })

  // Applique le thème + filtres de confort à chaque changement de réglage.
  useEffect(() => {
    applyTheme(settings)
  }, [settings.theme, settings.warmth, settings.brightness])

  // Reflète la langue effective sur <html lang> (accessibilité, césure…).
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const openDoc = (docId) => setRoute({ view: 'reader', docId })
  const goLibrary = () => setRoute({ view: 'library', docId: null })

  return (
    <>
      {route.view === 'library' ? (
        <Library onOpen={openDoc} />
      ) : (
        <Reader key={route.docId} docId={route.docId} onBack={goLibrary} />
      )}

      <UpdateBanner />

      {/* Grain de papier : donne de la matière, casse les aplats sombres */}
      <div className="grain" />

      {/* Voiles de confort visuel : toujours au-dessus du contenu */}
      <div className="comfort-veil" />
      <div className="brightness-veil" />
    </>
  )
}
