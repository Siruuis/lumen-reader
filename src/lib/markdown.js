/* Mini convertisseur Markdown -> HTML, suffisant pour les articles.
   On échappe d'abord le HTML, puis on applique les règles. */

function esc(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function inline(s) {
  return s
    .replace(/!\[([^\]]*)\]\(([^)\s]+)[^)]*\)/g, '<img alt="$1" src="$2" loading="lazy" />')
    .replace(/\[([^\]]+)\]\(([^)\s]+)[^)]*\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>')
}

export function markdownToHtml(md) {
  const lines = esc(md).split(/\r?\n/)
  const out = []
  let para = []
  let inList = false
  let listTag = 'ul'
  let inCode = false
  let codeBuf = []

  const flushPara = () => {
    if (para.length) {
      out.push(`<p>${inline(para.join(' '))}</p>`)
      para = []
    }
  }
  const closeList = () => {
    if (inList) {
      out.push(`</${listTag}>`)
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw

    // Blocs de code ```
    if (/^\s*```/.test(line)) {
      if (inCode) {
        out.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`)
        codeBuf = []
        inCode = false
      } else {
        flushPara()
        closeList()
        inCode = true
      }
      continue
    }
    if (inCode) {
      codeBuf.push(line)
      continue
    }

    // Ligne vide -> fin de paragraphe
    if (!line.trim()) {
      flushPara()
      closeList()
      continue
    }

    // Titres
    const h = line.match(/^(#{1,6})\s+(.*)$/)
    if (h) {
      flushPara()
      closeList()
      out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`)
      continue
    }

    // Séparateur
    if (/^\s*([-*_])\1{2,}\s*$/.test(line)) {
      flushPara()
      closeList()
      out.push('<hr />')
      continue
    }

    // Citation
    if (/^\s*>\s?/.test(line)) {
      flushPara()
      closeList()
      out.push(`<blockquote>${inline(line.replace(/^\s*>\s?/, ''))}</blockquote>`)
      continue
    }

    // Listes
    const ul = line.match(/^\s*[-*+]\s+(.*)$/)
    const ol = line.match(/^\s*\d+\.\s+(.*)$/)
    if (ul || ol) {
      flushPara()
      const tag = ol ? 'ol' : 'ul'
      if (!inList || listTag !== tag) {
        closeList()
        listTag = tag
        out.push(`<${tag}>`)
        inList = true
      }
      out.push(`<li>${inline((ul || ol)[1])}</li>`)
      continue
    }

    // Sinon : paragraphe
    closeList()
    para.push(line.trim())
  }

  flushPara()
  closeList()
  if (inCode) out.push(`<pre><code>${codeBuf.join('\n')}</code></pre>`)
  return out.join('\n')
}
