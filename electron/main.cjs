const { app, BrowserWindow, shell, nativeTheme } = require('electron')
const path = require('path')

const isDev = !!process.env.ELECTRON_DEV

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 820,
    minWidth: 720,
    minHeight: 560,
    backgroundColor: '#1c1916', // évite le flash blanc au démarrage (thème sombre)
    title: 'Lumen',
    autoHideMenuBar: true, // pas de barre de menu : interface épurée
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  // Ouvre les liens externes (articles, sources) dans le navigateur par défaut
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http')) shell.openExternal(url)
    return { action: 'deny' }
  })

  if (isDev) {
    win.loadURL('http://127.0.0.1:5180')
    win.webContents.openDevTools({ mode: 'detach' })
  } else {
    win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

// Mises à jour automatiques via GitHub Releases.
// Vérifie au démarrage, télécharge en arrière-plan, installe au prochain
// redémarrage (notification système). Inactif en développement.
function setupAutoUpdate() {
  if (isDev) return
  let autoUpdater
  try {
    ;({ autoUpdater } = require('electron-updater'))
  } catch {
    return // electron-updater absent (build non empaqueté) : on ignore
  }
  autoUpdater.autoDownload = true
  autoUpdater.on('error', (e) => console.error('update error', e?.message || e))
  autoUpdater.checkForUpdatesAndNotify().catch(() => {})
  // Re-vérifie toutes les 6 h si l'app reste ouverte longtemps
  setInterval(() => autoUpdater.checkForUpdatesAndNotify().catch(() => {}), 6 * 60 * 60 * 1000)
}

nativeTheme.themeSource = 'dark'

app.whenReady().then(() => {
  createWindow()
  setupAutoUpdate()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
