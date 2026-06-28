import { useEffect, useRef, useState, useCallback } from 'react'
import { markdownToHtml } from '../../lib/markdown'
import { getWebCache, setWebCache, updateDoc } from '../../lib/db'

/* Récupère le contenu propre d'un article via le reader Jina (gère le CORS),
   le met en cache local, et l'affiche en mode lecture confortable. */
export default function WebReader({ doc, url, initialPos, onLocation, controllerRef }) {
  const scrollRef = useRef(null)
  const articleRef = useRef(null)
  const [html, setHtml] = useState(null)
  const [title, setTitle] = useState(doc.title)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const didInit = useRef(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        let cache = await getWebCache(doc.id)
        if (!cache) {
          const res = await fetch('https://r.jina.ai/' + url, {
            headers: { Accept: 'text/markdown' },
          })
          if (!res.ok) throw new Error('HTTP ' + res.status)
          const md = await res.text()
          // Jina préfixe souvent : "Title: ...", "URL Source: ...", "Markdown Content:"
          const titleMatch = md.match(/^Title:\s*(.+)$/m)
          const body = md.split(/Markdown Content:\s*/).pop()
          cache = { title: titleMatch?.[1]?.trim() || doc.title, body }
          await setWebCache(doc.id, cache)
          if (cache.title && cache.title !== doc.title) {
            updateDoc(doc.id, { title: cache.title })
          }
        }
        if (!alive) return
        setTitle(cache.title)
        setHtml(markdownToHtml(cache.body))
        setLoading(false)
      } catch (e) {
        console.error(e)
        if (alive) {
          setError(
            "Impossible de récupérer cet article. Vérifie le lien ou ta connexion."
          )
          setLoading(false)
        }
      }
    })()
    return () => {
      alive = false
    }
  }, [doc.id, url])

  // Restaure la position au chargement
  useEffect(() => {
    if (!html || didInit.current) return
    didInit.current = true
    if (initialPos?.scroll) {
      requestAnimationFrame(() => {
        const el = scrollRef.current
        if (el) el.scrollTop = initialPos.scroll * (el.scrollHeight - el.clientHeight)
      })
    }
  }, [html])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = el.scrollHeight - el.clientHeight
    const pct = max > 0 ? el.scrollTop / max : 0
    onLocation({ position: { scroll: pct }, progress: pct, label: `${Math.round(pct * 100)} %` })
  }, [onLocation])

  // API
  useEffect(() => {
    controllerRef.current = {
      goTo: (pos) => {
        const el = scrollRef.current
        if (el && typeof pos?.scroll === 'number') {
          el.scrollTo({
            top: pos.scroll * (el.scrollHeight - el.clientHeight),
            behavior: 'smooth',
          })
        }
      },
      getCurrent: () => {
        const el = scrollRef.current
        const max = el ? el.scrollHeight - el.clientHeight : 0
        const pct = max > 0 ? el.scrollTop / max : 0
        // Cherche le dernier titre au-dessus du haut du viewport
        let label = `${Math.round(pct * 100)}% de l'article`
        let preview = ''
        const heads = articleRef.current?.querySelectorAll('h1,h2,h3')
        if (heads) {
          const top = scrollRef.current.scrollTop
          let best = null
          heads.forEach((h) => {
            if (h.offsetTop <= top + 80) best = h
          })
          if (best) {
            label = best.textContent.slice(0, 60)
            preview = `${Math.round(pct * 100)}% de l'article`
          }
        }
        return { position: { scroll: pct }, label, preview }
      },
    }
  }, [])

  if (error) return <div className="reader-error">{error}</div>
  if (loading)
    return (
      <div className="reader-loading">
        <div className="spinner" />
        <p>Préparation du mode lecture…</p>
      </div>
    )

  return (
    <div className="web-scroll" ref={scrollRef} onScroll={onScroll}>
      <article
        ref={articleRef}
        className="prose reader-surface"
        style={{ maxWidth: 'var(--reader-width)' }}
      >
        <h1 className="prose-title">{title}</h1>
        <p className="prose-source">
          <a href={url} target="_blank" rel="noopener">
            {new URL(url).hostname}
          </a>
        </p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </div>
  )
}
