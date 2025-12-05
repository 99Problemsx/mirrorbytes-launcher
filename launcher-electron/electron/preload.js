const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),

  // Game operations
  launchGame: (gameId) => ipcRenderer.invoke('game:launch', gameId),
  getGamePath: (gameId) => ipcRenderer.invoke('game:getPath', gameId),
  getInstallPath: (gameId) => ipcRenderer.invoke('game:getInstallPath', gameId),
  checkFileExists: (filePath) => ipcRenderer.invoke('file:exists', filePath),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  downloadGame: (gameId, onProgress, onExtracting) => {
    // Listen for progress updates
    ipcRenderer.on('download:progress', (event, progress) => {
      if (onProgress) onProgress(progress);
    });
    
    // Listen for extraction status
    ipcRenderer.on('download:extracting', (event, isExtracting) => {
      if (onExtracting) onExtracting(isExtracting);
    });
    
    return ipcRenderer.invoke('game:download', gameId);
  },

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:get'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),

  // Shell operations
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openSaveFolder: () => ipcRenderer.invoke('shell:openSaveFolder'),
  openPath: (path) => ipcRenderer.invoke('shell:openPath', path),
  
  // Uninstall game
  uninstallGame: (gameId) => ipcRenderer.invoke('game:uninstall', gameId),
  
  // Launcher updates
  checkLauncherUpdate: () => ipcRenderer.invoke('launcher:check-update'),
  checkGameUpdate: (gameId) => ipcRenderer.invoke('game:check-update', gameId),
  installLauncherUpdate: () => ipcRenderer.invoke('launcher:install-update'),
  
  // Delta patching
  getGameVersion: (gameId) => ipcRenderer.invoke('game:get-version', gameId),
  deltaUpdate: (gameId, targetVersion, onProgress) => {
    // Listen for delta patch progress updates
    if (onProgress) {
      ipcRenderer.on('delta-patch:progress', (event, progress) => {
        if (progress.gameId === gameId) {
          onProgress(progress);
        }
      });
    }
    
    return ipcRenderer.invoke('game:delta-update', gameId, targetVersion);
  },
});

// Expose electronAPI for new features
contextBridge.exposeInMainWorld('electronAPI', {
  // Discord Rich Presence
  initializeDiscord: () => ipcRenderer.invoke('discord:initialize'),
  getDiscordStatus: () => ipcRenderer.invoke('discord:get-status'),
  enableDiscord: () => ipcRenderer.invoke('discord:enable'),
  disableDiscord: () => ipcRenderer.invoke('discord:disable'),
  setDiscordActivity: (type, data) => ipcRenderer.invoke('discord:set-activity', type, data),
  
  // Mystery Gifts
  saveMysteryGifts: (redeemedCodes) => ipcRenderer.invoke('mysterygift:save', redeemedCodes),
  checkGiftClaimed: (code) => ipcRenderer.invoke('mysterygift:check-claimed', code),
  
  // Auto-Updates
  checkForUpdates: () => ipcRenderer.invoke('updates:check'),
  downloadUpdate: (updateInfo) => ipcRenderer.invoke('updates:download', updateInfo),
  rollbackUpdate: (installPath) => ipcRenderer.invoke('updates:rollback', installPath),
  
  // Update event listeners
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },
  onUpdateProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, progress) => callback(progress));
  },
  onUpdateComplete: (callback) => {
    ipcRenderer.on('update-complete', (event, version) => callback(version));
  },
  onUpdateError: (callback) => {
    ipcRenderer.on('update-error', (event, error) => callback(error));
  },
  
  // Installation verification
  verifyInstallation: (installPath) => ipcRenderer.invoke('game:verify', installPath),
});
