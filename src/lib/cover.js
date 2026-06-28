/* Génère une vignette de couverture (data URL JPEG) à partir de la 1re page
   d'un PDF ou de la couverture d'un EPUB. Stockée dans la meta du document. */
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import ePub from 'epubjs'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const TARGET_W = 360

async function toArrayBuffer(src) {
  return src instanceof Blob ? await src.arrayBuffer() : src
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })
}

export async function generatePdfCover(src) {
  const data = await toArrayBuffer(src)
  const pdf = await pdfjsLib.getDocument({ data }).promise
  try {
    const page = await pdf.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const scale = TARGET_W / base.width
    const vp = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = vp.width
    canvas.height = vp.height
    const ctx = canvas.getContext('2d')
    await page.render({ canvasContext: ctx, viewport: vp }).promise
    return canvas.toDataURL('image/jpeg', 0.82)
  } finally {
    pdf.destroy()
  }
}

export async function generateEpubCover(src) {
  const data = await toArrayBuffer(src)
  const book = ePub(data)
  try {
    await book.ready
    const coverUrl = await book.coverUrl()
    if (!coverUrl) return null
    const blob = await (await fetch(coverUrl)).blob()
    return await blobToDataUrl(blob)
  } catch {
    return null
  } finally {
    try {
      book.destroy()
    } catch {}
  }
}

export async function generateCover(doc, file) {
  if (!file) return null
  try {
    if (doc.type === 'pdf') return await generatePdfCover(file)
    if (doc.type === 'epub') return await generateEpubCover(file)
  } catch (e) {
    console.warn('cover generation failed', e)
  }
  return null
}
