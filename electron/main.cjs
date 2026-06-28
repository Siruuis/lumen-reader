const { app, BrowserWindow, shell, nativeTheme, ipcMain } = require('electron')
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
// Vérifie au démarrage (puis toutes les 6 h), télécharge en arrière-plan, et
// remonte l'état à l'UI (bannière in-app). Inactif en développement.
function setupAutoUpdate() {
  if (isDev) return
  let autoUpdater
  try {
    ;({ autoUpdater } = require('electron-updater'))
  } catch {
    return // electron-updater absent (build non empaqueté) : on ignore
  }

  const send = (status) => {
    for (const w of BrowserWindow.getAllWindows()) {
      if (!w.isDestroyed()) w.webContents.send('updater:status', status)
    }
  }

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (i) => send({ state: 'available', version: i?.version }))
  autoUpdater.on('download-progress', (p) =>
    send({ state: 'downloading', percent: Math.round(p?.percent || 0) })
  )
  autoUpdater.on('update-downloaded', (i) => send({ state: 'ready', version: i?.version }))
  autoUpdater.on('error', (e) => send({ state: 'error', message: String(e?.message || e) }))

  ipcMain.on('updater:restart', () => {
    try {
      autoUpdater.quitAndInstall()
    } catch (e) {
      console.error('quitAndInstall failed', e)
    }
  })

  const check = () => autoUpdater.checkForUpdates().catch(() => {})
  check()
  setInterval(check, 6 * 60 * 60 * 1000)
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
