# Lumen · lecteur cosy

Application **desktop** (Electron + React) reposante pour les yeux : **PDF**, **EPUB** et **articles en ligne**, avec dark mode doux, réglages de confort et marque-pages personnalisés. Tout reste en **local** sur ta machine (IndexedDB) - aucun serveur, aucune donnée envoyée ailleurs.

## Téléchargement

Dernière version : **https://github.com/Siruuis/lumen-reader/releases/latest**

Les installateurs Windows de ce projet sont signés numériquement (code signing).
Free code signing provided by [SignPath.io](https://about.signpath.io/),
certificate by [SignPath Foundation](https://signpath.org/).

## Lancer

```bash
npm install
npm run dev      # ouvre la fenêtre Lumen (Vite + Electron, hot-reload)
```

## Mises à jour automatiques

L'app vérifie GitHub Releases au démarrage (puis toutes les 6 h), télécharge la
nouvelle version en arrière-plan et l'installe au prochain redémarrage - aucune
manipulation, plus besoin de remplacer l'`.exe`.

**Publier une nouvelle version :**

```bash
npm run release   # bump le numéro de version, crée le tag et le pousse
```

Le push du tag déclenche **GitHub Actions** (`.github/workflows/release.yml`) qui
build l'installateur Windows et le publie automatiquement dans les Releases du
dépôt `Siruuis/lumen-reader`. Les apps déjà installées se mettent à jour seules.

> Le tout premier installateur est ici :
> https://github.com/Siruuis/lumen-reader/releases/latest
> Installe-le une fois ; ensuite tout est automatique.

## Construire l'application (local, optionnel)

```bash
npm run pack     # crée l'app autonome dans release/Lumen-win32-x64/ (Lumen.exe)
npm start        # lance l'app à partir du dist déjà compilé
npm run build    # compile seulement l'interface dans dist/
```

`npm run pack` produit un dossier `release/Lumen-win32-x64/` contenant **`Lumen.exe`**
directement double-cliquable (à copier où tu veux, aucune installation requise).

> **Installateur `.exe` (`npm run dist`)** : utilise electron-builder. Sur Windows,
> il faut activer le **Mode développeur** (Paramètres → Confidentialité et sécurité →
> Pour les développeurs) **ou** lancer le terminal en administrateur, car l'outil de
> signature contient des liens symboliques que Windows refuse de créer sans privilège.
> Sans ça, utilise `npm run pack` qui n'a pas cette contrainte.

> L'app reste 100 % locale et hors-ligne, sauf le mode lecture d'articles web
> (qui va chercher le contenu de l'URL) et les polices Google au premier lancement.

## Ce que ça fait

- **3 formats** : glisse un PDF ou un EPUB, ou colle un lien (PDF / EPUB / article web). Les articles passent par le mode lecture (texte propre, sans pub).
- **Dark mode pensé pour les yeux** : 5 ambiances (Crépuscule, Encre, Nuit, Sépia, Crème) - jamais de blanc pur sur noir pur. Les PDF clairs sont adoucis automatiquement en thème sombre.
- **Confort visuel** : curseurs de chaleur (anti lumière bleue) et de luminosité, taille de texte, hauteur de ligne, largeur de page, police (serif / sans / lisible-dyslexie), espacement.
- **Mode focus** (`F`) : masque toute l'interface pour ne garder que le texte.
- **Marque-pages personnalisés** : nomme-les, ajoute une note, et reviens-y d'un clic. Raccourci `B`.
- **Reprise auto** : rouvre un document exactement là où tu t'étais arrêté. La progression s'affiche dans la bibliothèque.

## Raccourcis

| Touche | Action |
| --- | --- |
| `B` | Ajouter un marque-page à la position actuelle |
| `F` | Activer / quitter le mode focus |
| `Échap` | Quitter le focus, ou revenir à la bibliothèque |
| `←` `→` | Page précédente / suivante (boutons de la barre) |

## Notes techniques

- **PDF** : rendu continu et paresseux via `pdf.js` (les pages ne se dessinent qu'à l'approche du viewport → fluide même sur de longs documents).
- **EPUB** : reflow via `epub.js`, thème injecté dans le contenu, progression par CFI.
- **Web** : extraction du contenu via le reader `r.jina.ai` (contourne le CORS), converti en lecture confortable et mis en cache local.
- Les liens directs PDF/EPUB en ligne dépendent du CORS du site hôte ; si un lien est bloqué, télécharge le fichier et glisse-le.

Stack : Electron + Vite + React, `pdfjs-dist`, `epubjs`, `idb-keyval`, `zustand`.
