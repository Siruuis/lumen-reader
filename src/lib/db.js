/* ============================================================
   Persistance locale (IndexedDB via idb-keyval)
   - meta des documents (liste de la bibliothèque)
   - blobs des fichiers (PDF/EPUB importés)
   - bookmarks par document
   - dernière position de lecture par document
   Tout reste en local dans le navigateur, aucun serveur.
   ============================================================ */
import { get, set, del, keys } from 'idb-keyval'

const DOCS_INDEX = 'lumen:docs' // tableau d'IDs

function uid() {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  )
}

/* ---------- Index des documents ---------- */
export async function listDocs() {
  const ids = (await get(DOCS_INDEX)) || []
  const docs = await Promise.all(ids.map((id) => get(`doc:${id}`)))
  return docs
    .filter(Boolean)
    .sort((a, b) => (b.lastOpened || b.addedAt) - (a.lastOpened || a.addedAt))
}

async function pushIndex(id) {
  const ids = (await get(DOCS_INDEX)) || []
  if (!ids.includes(id)) {
    ids.push(id)
    await set(DOCS_INDEX, ids)
  }
}

async function removeIndex(id) {
  const ids = (await get(DOCS_INDEX)) || []
  await set(
    DOCS_INDEX,
    ids.filter((x) => x !== id)
  )
}

/* ---------- Création de documents ---------- */
export async function addFileDoc(file, type) {
  const id = uid()
  const doc = {
    id,
    type, // 'pdf' | 'epub'
    source: 'file',
    title: file.name.replace(/\.(pdf|epub)$/i, ''),
    fileName: file.name,
    size: file.size,
    addedAt: Date.now(),
    lastOpened: Date.now(),
    progress: 0,
  }
  await set(`file:${id}`, file) // le Blob/File est stocké tel quel
  await set(`doc:${id}`, doc)
  await pushIndex(id)
  return doc
}

export async function addUrlDoc(url, type, title) {
  const id = uid()
  const doc = {
    id,
    type, // 'pdf' | 'epub' | 'web'
    source: 'url',
    url,
    title: title || prettyTitleFromUrl(url),
    addedAt: Date.now(),
    lastOpened: Date.now(),
    progress: 0,
  }
  await set(`doc:${id}`, doc)
  await pushIndex(id)
  return doc
}

function prettyTitleFromUrl(url) {
  try {
    const u = new URL(url)
    const last = u.pathname.split('/').filter(Boolean).pop()
    return decodeURIComponent(last || u.hostname)
      .replace(/\.(pdf|epub|html?)$/i, '')
      .replace(/[-_]+/g, ' ')
  } catch {
    return url
  }
}

export async function getDoc(id) {
  return get(`doc:${id}`)
}

export async function getFile(id) {
  return get(`file:${id}`)
}

export async function updateDoc(id, patch) {
  const doc = await get(`doc:${id}`)
  if (!doc) return null
  const next = { ...doc, ...patch }
  await set(`doc:${id}`, next)
  return next
}

export async function touchDoc(id) {
  return updateDoc(id, { lastOpened: Date.now() })
}

export async function deleteDoc(id) {
  await del(`doc:${id}`)
  await del(`file:${id}`)
  await del(`bm:${id}`)
  await del(`pos:${id}`)
  await del(`webcache:${id}`)
  await del(`notes:${id}`)
  await removeIndex(id)
}

/* ---------- Position de lecture ---------- */
export async function getPosition(id) {
  return get(`pos:${id}`)
}
export async function savePosition(id, position) {
  await set(`pos:${id}`, position)
}

/* ---------- Bookmarks ---------- */
export async function getBookmarks(id) {
  return (await get(`bm:${id}`)) || []
}

export async function addBookmark(docId, bookmark) {
  const list = await getBookmarks(docId)
  const bm = { id: uid(), createdAt: Date.now(), ...bookmark }
  list.push(bm)
  await set(`bm:${docId}`, list)
  return bm
}

export async function updateBookmark(docId, bmId, patch) {
  const list = await getBookmarks(docId)
  const next = list.map((b) => (b.id === bmId ? { ...b, ...patch } : b))
  await set(`bm:${docId}`, next)
  return next
}

export async function deleteBookmark(docId, bmId) {
  const list = await getBookmarks(docId)
  await set(
    `bm:${docId}`,
    list.filter((b) => b.id !== bmId)
  )
}

/* ---------- Bloc-notes libre (un par document) ---------- */
export async function getNotes(id) {
  return (await get(`notes:${id}`)) || ''
}
export async function saveNotes(id, text) {
  await set(`notes:${id}`, text)
}

/* ---------- Cache du mode lecture web ---------- */
export async function getWebCache(id) {
  return get(`webcache:${id}`)
}
export async function setWebCache(id, data) {
  await set(`webcache:${id}`, data)
}

/* ---------- Divers ---------- */
export async function storageKeys() {
  return keys()
}
