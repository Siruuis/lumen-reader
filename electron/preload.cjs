// Pont sécurisé (contextIsolation) entre le process principal et l'app React.
// Expose l'état des mises à jour et l'action « redémarrer pour installer ».
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('lumenUpdater', {
  // S'abonne aux changements d'état ; renvoie une fonction de désabonnement.
  onStatus: (cb) => {
    const listener = (_e, data) => cb(data)
    ipcRenderer.on('updater:status', listener)
    return () => ipcRenderer.removeListener('updater:status', listener)
  },
  // Quitte et installe la mise à jour téléchargée.
  restart: () => ipcRenderer.send('updater:restart'),
})
