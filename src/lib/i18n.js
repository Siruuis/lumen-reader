/* Internationalisation légère.
   Règle demandée : français si la langue de l'appareil est le français,
   anglais pour tout le reste. Un réglage manuel (auto/fr/en) reste possible. */
import { useSettings } from '../store/useSettings'

export function detectLang() {
  const list =
    (typeof navigator !== 'undefined' &&
      (navigator.languages || [navigator.language])) ||
    ['en']
  return list.some((l) => (l || '').toLowerCase().startsWith('fr')) ? 'fr' : 'en'
}

const DICT = {
  fr: {
    'common.open': 'Ouvrir',
    'common.cancel': 'Annuler',
    'common.save': 'Enregistrer',
    'common.remove': 'Retirer',

    'lib.eyebrow': 'Ton coin lecture',
    'lib.greeting.night': 'Bonne nuit',
    'lib.greeting.morning': 'Bonjour',
    'lib.greeting.afternoon': 'Bel après-midi',
    'lib.greeting.evening': 'Bonsoir',
    'lib.heroAccent': 'Pose-toi et lis.',
    'lib.heroSub':
      'PDF, livres et articles - doux pour les yeux, sans distraction. Tout reste sur ta machine.',
    'lib.resume': 'Reprendre la lecture',
    'lib.dzTitle': 'Dépose un PDF ou un EPUB',
    'lib.dzSub': 'ou clique pour choisir',
    'lib.or': 'ou colle un lien',
    'lib.urlPlaceholder': 'PDF, EPUB ou article web…',
    'lib.shelf': 'Ma bibliothèque',
    'lib.empty': 'Rien encore. Ajoute ton premier document pour commencer à lire ✨',
    'lib.read': '{n}% lu',
    'lib.type.pdf': 'PDF',
    'lib.type.epub': 'EPUB',
    'lib.type.web': 'Article',
    'lib.removeTitle': 'Retirer de la bibliothèque',
    'lib.confirmTitle': 'Retirer ce document ?',
    'lib.confirmBody':
      '« {title} » sera retiré de ta bibliothèque, avec ses marque-pages, notes et position de lecture. Le fichier d’origine sur ton disque n’est pas touché.',

    'tb.back': 'Bibliothèque (Échap)',
    'tb.prev': 'Précédent',
    'tb.next': 'Suivant',
    'tb.addBookmark': 'Ajouter un marque-page (B)',
    'tb.bookmarks': 'Mes marque-pages',
    'tb.notes': 'Bloc-notes (N)',
    'tb.focus': 'Mode focus (F)',
    'tb.appearance': 'Apparence',

    'settings.title': 'Apparence & confort',
    'set.ambiance': 'Ambiance',
    'set.font': 'Police',
    'set.reading': 'Lecture',
    'set.fontSize': 'Taille du texte',
    'set.lineHeight': 'Hauteur de ligne',
    'set.width': 'Largeur de page',
    'set.letter': 'Espacement des lettres',
    'set.comfort': 'Confort des yeux',
    'set.warmth': 'Chaleur (anti lumière bleue)',
    'set.brightness': 'Luminosité',
    'set.hint':
      'Astuce : le soir, monte un peu la chaleur et baisse la luminosité pour réduire la fatigue visuelle.',
    'set.language': 'Langue',
    'set.lang.auto': 'Auto',
    'set.lang.fr': 'Français',
    'set.lang.en': 'English',

    'font.serif': 'Serif',
    'font.sans': 'Sans',
    'font.legible': 'Lisible',

    'theme.dusk.name': 'Crépuscule',
    'theme.dusk.hint': 'Sombre & chaud · le soir',
    'theme.ink.name': 'Encre',
    'theme.ink.hint': 'Sombre & doux · repos maximal',
    'theme.midnight.name': 'Nuit',
    'theme.midnight.hint': 'Sombre & bleuté',
    'theme.sepia.name': 'Sépia',
    'theme.sepia.hint': 'Papier ancien · le jour',
    'theme.cream.name': 'Crème',
    'theme.cream.hint': 'Clair & neutre',

    'bm.title': 'Marque-pages',
    'bm.markCurrent': 'Marquer la position actuelle',
    'bm.emptyBefore': 'Aucun marque-page. Clique sur l’icône signet (ou appuie sur',
    'bm.emptyAfter': ') pour garder ta place.',
    'bm.namePlaceholder': 'Nom du marque-page',
    'bm.notePlaceholder': 'Une note (optionnel)…',
    'bm.editTitle': 'Renommer / noter',
    'bm.deleteTitle': 'Supprimer',
    'bm.defaultLabel': 'Marque-page',

    'notes.title': 'Mes notes',
    'notes.close': 'Fermer (N)',
    'notes.linkPage': 'Lier la page',
    'notes.linkTitle': 'Insérer un lien vers la page actuelle',
    'notes.placeholder':
      'Écris ce que tu veux ici — idées, citations, questions… Sélectionne du texte pour le colorer, et « Lier la page » pour pointer vers l’endroit où tu lis.',
    'notes.saving': 'Enregistrement…',
    'notes.saved': '✓ Enregistré',
    'notes.wordSg': 'mot',
    'notes.wordPl': 'mots',
    'notes.copy': 'Copier',
    'notes.copied': 'Copié',

    'ink.default': 'Défaut',
    'ink.amber': 'Ambre',
    'ink.rust': 'Rouille',
    'ink.coral': 'Corail',
    'ink.rose': 'Rose',
    'ink.plum': 'Prune',
    'ink.lavender': 'Lavande',
    'ink.blue': 'Bleu',
    'ink.teal': 'Sarcelle',
    'ink.sage': 'Sauge',
    'ink.moss': 'Mousse',

    'reader.opening': 'Ouverture…',
    'reader.bookmarkAdded': 'Marque-page ajouté',
    'reader.focusHint': 'Mode focus : appuie sur le texte pour afficher les contrôles.',

    'pdf.loading': 'Chargement du PDF…',
    'pdf.errFile': 'Impossible d’ouvrir ce PDF (fichier corrompu ?).',
    'pdf.errUrl':
      'Impossible de charger ce PDF depuis l’URL. Le site bloque peut-être l’accès direct (CORS). Télécharge-le puis glisse-le ici.',
    'pdf.page': 'Page {n}',
    'pdf.totalPages': '{n} pages au total',
    'pdf.zoomOut': 'Dézoomer',
    'pdf.zoomIn': 'Zoomer',
    'pdf.single': 'Une page par ligne',
    'pdf.spread': 'Deux pages par ligne',

    'epub.loading': 'Ouverture du livre…',
    'epub.errFile': 'Impossible d’ouvrir cet EPUB.',
    'epub.errUrl':
      'Impossible de charger cet EPUB depuis l’URL (CORS probable). Télécharge-le et glisse-le ici.',
    'epub.position': 'Position dans le livre',

    'web.loading': 'Préparation du mode lecture…',
    'web.err': 'Impossible de récupérer cet article. Vérifie le lien ou ta connexion.',
    'web.percent': '{n}% de l’article',

    'upd.updating': 'Mise à jour en cours…',
    'upd.ready': 'Lumen {v} est prête à installer.',
    'upd.readySub': 'Redémarre pour appliquer la mise à jour.',
    'upd.restart': 'Redémarrer',
    'upd.later': 'Plus tard',
  },

  en: {
    'common.open': 'Open',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.remove': 'Remove',

    'lib.eyebrow': 'Your reading corner',
    'lib.greeting.night': 'Good night',
    'lib.greeting.morning': 'Good morning',
    'lib.greeting.afternoon': 'Good afternoon',
    'lib.greeting.evening': 'Good evening',
    'lib.heroAccent': 'Settle in and read.',
    'lib.heroSub':
      'PDFs, books and articles - easy on the eyes, distraction-free. Everything stays on your device.',
    'lib.resume': 'Resume reading',
    'lib.dzTitle': 'Drop a PDF or EPUB',
    'lib.dzSub': 'or click to choose',
    'lib.or': 'or paste a link',
    'lib.urlPlaceholder': 'PDF, EPUB or web article…',
    'lib.shelf': 'My library',
    'lib.empty': 'Nothing yet. Add your first document to start reading ✨',
    'lib.read': '{n}% read',
    'lib.type.pdf': 'PDF',
    'lib.type.epub': 'EPUB',
    'lib.type.web': 'Article',
    'lib.removeTitle': 'Remove from library',
    'lib.confirmTitle': 'Remove this document?',
    'lib.confirmBody':
      '“{title}” will be removed from your library, along with its bookmarks, notes and reading position. The original file on your disk is not affected.',

    'tb.back': 'Library (Esc)',
    'tb.prev': 'Previous',
    'tb.next': 'Next',
    'tb.addBookmark': 'Add bookmark (B)',
    'tb.bookmarks': 'My bookmarks',
    'tb.notes': 'Notes (N)',
    'tb.focus': 'Focus mode (F)',
    'tb.appearance': 'Appearance',

    'settings.title': 'Appearance & comfort',
    'set.ambiance': 'Ambiance',
    'set.font': 'Font',
    'set.reading': 'Reading',
    'set.fontSize': 'Text size',
    'set.lineHeight': 'Line height',
    'set.width': 'Page width',
    'set.letter': 'Letter spacing',
    'set.comfort': 'Eye comfort',
    'set.warmth': 'Warmth (blue-light filter)',
    'set.brightness': 'Brightness',
    'set.hint':
      'Tip: in the evening, raise the warmth a bit and lower the brightness to reduce eye strain.',
    'set.language': 'Language',
    'set.lang.auto': 'Auto',
    'set.lang.fr': 'Français',
    'set.lang.en': 'English',

    'font.serif': 'Serif',
    'font.sans': 'Sans',
    'font.legible': 'Readable',

    'theme.dusk.name': 'Dusk',
    'theme.dusk.hint': 'Dark & warm · evenings',
    'theme.ink.name': 'Ink',
    'theme.ink.hint': 'Dark & soft · maximum rest',
    'theme.midnight.name': 'Midnight',
    'theme.midnight.hint': 'Dark & blue-toned',
    'theme.sepia.name': 'Sepia',
    'theme.sepia.hint': 'Aged paper · daytime',
    'theme.cream.name': 'Cream',
    'theme.cream.hint': 'Light & neutral',

    'bm.title': 'Bookmarks',
    'bm.markCurrent': 'Bookmark current position',
    'bm.emptyBefore': 'No bookmarks yet. Tap the bookmark icon (or press',
    'bm.emptyAfter': ') to save your spot.',
    'bm.namePlaceholder': 'Bookmark name',
    'bm.notePlaceholder': 'A note (optional)…',
    'bm.editTitle': 'Rename / add note',
    'bm.deleteTitle': 'Delete',
    'bm.defaultLabel': 'Bookmark',

    'notes.title': 'My notes',
    'notes.close': 'Close (N)',
    'notes.linkPage': 'Link page',
    'notes.linkTitle': 'Insert a link to the current page',
    'notes.placeholder':
      'Write whatever you want here — ideas, quotes, questions… Select text to color it, and “Link page” to point to where you’re reading.',
    'notes.saving': 'Saving…',
    'notes.saved': '✓ Saved',
    'notes.wordSg': 'word',
    'notes.wordPl': 'words',
    'notes.copy': 'Copy',
    'notes.copied': 'Copied',

    'ink.default': 'Default',
    'ink.amber': 'Amber',
    'ink.rust': 'Rust',
    'ink.coral': 'Coral',
    'ink.rose': 'Rose',
    'ink.plum': 'Plum',
    'ink.lavender': 'Lavender',
    'ink.blue': 'Blue',
    'ink.teal': 'Teal',
    'ink.sage': 'Sage',
    'ink.moss': 'Moss',

    'reader.opening': 'Opening…',
    'reader.bookmarkAdded': 'Bookmark added',
    'reader.focusHint': 'Focus mode: tap the text to show the controls.',

    'pdf.loading': 'Loading PDF…',
    'pdf.errFile': 'Couldn’t open this PDF (corrupted file?).',
    'pdf.errUrl':
      'Couldn’t load this PDF from the URL. The site may block direct access (CORS). Download it, then drop it here.',
    'pdf.page': 'Page {n}',
    'pdf.totalPages': '{n} pages total',
    'pdf.zoomOut': 'Zoom out',
    'pdf.zoomIn': 'Zoom in',
    'pdf.single': 'One page per row',
    'pdf.spread': 'Two pages per row',

    'epub.loading': 'Opening book…',
    'epub.errFile': 'Couldn’t open this EPUB.',
    'epub.errUrl':
      'Couldn’t load this EPUB from the URL (likely CORS). Download it and drop it here.',
    'epub.position': 'Position in the book',

    'web.loading': 'Preparing reading mode…',
    'web.err': 'Couldn’t fetch this article. Check the link or your connection.',
    'web.percent': '{n}% of the article',

    'upd.updating': 'Updating…',
    'upd.ready': 'Lumen {v} is ready to install.',
    'upd.readySub': 'Restart to apply the update.',
    'upd.restart': 'Restart',
    'upd.later': 'Later',
  },
}

export function translate(lang, key, vars) {
  const table = DICT[lang] || DICT.en
  let s = table[key] != null ? table[key] : DICT.en[key] != null ? DICT.en[key] : key
  if (vars) for (const k in vars) s = s.replaceAll(`{${k}}`, vars[k])
  return s
}

/* Langue effective (réactive) : réglage manuel ou détection appareil. */
export function useLang() {
  const lang = useSettings((s) => s.lang)
  return lang === 'auto' ? detectLang() : lang
}

/* Hook principal : renvoie une fonction t(key, vars). */
export function useT() {
  const lang = useLang()
  return (key, vars) => translate(lang, key, vars)
}
