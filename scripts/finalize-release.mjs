/* Après signature SignPath, le binaire change → le hash dans latest.yml ne
   correspond plus. Ce script recalcule sha512 + taille de l'installateur signé,
   met à jour latest.yml, et supprime le .blockmap (invalidé par la signature ;
   electron-updater bascule alors sur un téléchargement complet, ce qui reste OK).

   Usage : node scripts/finalize-release.mjs [dossier]   (défaut: release) */
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
  rmSync,
  copyFileSync,
} from 'fs'
import { createHash } from 'crypto'
import path from 'path'
import yaml from 'js-yaml'

const dir = process.argv[2] || 'release'
const ymlPath = path.join(dir, 'latest.yml')

if (!existsSync(ymlPath)) {
  console.error(`latest.yml introuvable dans ${dir}/`)
  process.exit(1)
}

// Cherche l'installateur signé (.exe), même s'il a été déposé dans un sous-dossier.
function findExe(root) {
  for (const name of readdirSync(root)) {
    const full = path.join(root, name)
    const st = statSync(full)
    if (st.isDirectory()) {
      const nested = findExe(full)
      if (nested) return nested
    } else if (name.toLowerCase().endsWith('.exe')) {
      return full
    }
  }
  return null
}

let exePath = findExe(dir)
if (!exePath) {
  console.error('Aucun .exe trouvé.')
  process.exit(1)
}

const data = yaml.load(readFileSync(ymlPath, 'utf8'))
const expectedName = data.path || path.basename(exePath)
const target = path.join(dir, expectedName)

// Ramène l'exe signé à côté de latest.yml, sous le nom attendu.
if (path.resolve(exePath) !== path.resolve(target)) {
  copyFileSync(exePath, target)
  exePath = target
}

const buf = readFileSync(exePath)
const sha512 = createHash('sha512').update(buf).digest('base64')
const size = buf.length

data.sha512 = sha512
data.path = expectedName
if (Array.isArray(data.files)) {
  data.files = data.files.map((f) =>
    f.url && f.url.toLowerCase().endsWith('.exe')
      ? { url: expectedName, sha512, size } // on retire blockMapSize
      : f
  )
}

// Supprime le blockmap devenu invalide.
const blockmap = target + '.blockmap'
if (existsSync(blockmap)) rmSync(blockmap)

writeFileSync(ymlPath, yaml.dump(data, { lineWidth: -1 }))
console.log(`latest.yml mis à jour pour ${expectedName} (${size} octets)`)
