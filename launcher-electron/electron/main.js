// Load environment variables - with error handling for production
try {
  require('dotenv').config();
} catch (error) {
  console.log('⚠️ dotenv not available (production mode)');
}

const { app, BrowserWindow, ipcMain, shell, autoUpdater } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const https = require('https');
const fsSync = require('fs');

// Lazy load AdmZip when needed
let AdmZip = null;
function getAdmZip() {
  if (!AdmZip) {
    try {
      AdmZip = require('adm-zip');
    } catch (error) {
      console.error('Failed to load adm-zip:', error);
      AdmZip = null;
    }
  }
  return AdmZip;
}

// Cross-platform path helper
function getGameInstallBase() {
  // Use userData directory which is cross-platform
  // Windows: C:\Users\<user>\AppData\Roaming\<app name>
  // macOS: ~/Library/Application Support/<app name>
  // Linux: ~/.config/<app name>
  return path.join(app.getPath('userData'), 'Games');
}

// Game configurations
const GAME_CONFIGS = {
  'illusion': {
    installPath: path.join(getGameInstallBase(), 'Pokemon Illusion'),
    exePath: path.join(getGameInstallBase(), 'Pokemon Illusion', 'Game.exe'),
    saveFolder: 'Pokemon Illusion',
    repo: 'Illusion'
  },
  'zorua': {
    installPath: path.join(getGameInstallBase(), 'Zorua The Divine Deception'),
    exePath: path.join(getGameInstallBase(), 'Zorua The Divine Deception', 'Game.exe'),
    saveFolder: 'Zorua The Divine Deception',
    repo: 'Zorua-the-divine-deception'
  }
};

// Import services - with error handling for production builds
let discordService = null;
let autoUpdateService = null;
let mysteryGiftService = null;

// Lazy load services when needed
function getDiscordService() {
  if (!discordService) {
    try {
      const service = require('../src/services/discordService');
      discordService = service.getDiscordService();
    } catch (error) {
      console.error('Failed to load Discord service:', error);
      discordService = null;
    }
  }
  return discordService;
}

function getAutoUpdateService(gameId) {
  if (!autoUpdateService) {
    try {
      const service = require('../src/services/autoUpdateService');
      autoUpdateService = service.getAutoUpdateService(gameId);
    } catch (error) {
      console.error('Failed to load Auto Update service:', error);
      autoUpdateService = null;
    }
  }
  return autoUpdateService;
}

function getMysteryGiftService() {
  if (!mysteryGiftService) {
    try {
      const service = require('../src/services/mysteryGiftService');
      mysteryGiftService = service.getMysteryGiftService();
    } catch (error) {
      console.error('Failed to load Mystery Gift service:', error);
      mysteryGiftService = null;
    }
  }
  return mysteryGiftService;
}

let mainWindow;

// Allow app to quit when window is closed
let forceQuit = true;

function createWindow() {
  console.log('Creating window...');
  
  // Entferne Menü in Production (verhindert DevTools-Zugriff über Menü)
  if (app.isPackaged) {
    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
  }
  
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    minWidth: 1024,
    minHeight: 600,
    frame: false, // Frameless window like Riot Client
    transparent: false,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      devTools: app.isPackaged ? false : true // DevTools nur im Development
    },
    icon: path.join(__dirname, '../assets/icon.png.svg'),
    show: false // Don't show until ready
  });

  console.log('Window created, loading URL...');

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();
    mainWindow.focus();
  });

  // Load the app - use localhost in dev, dist/index.html in production
  const loadURL = async () => {
    try {
      if (app.isPackaged) {
        // Production: load from dist folder
        const indexPath = path.join(__dirname, '../dist/index.html');
        await mainWindow.loadFile(indexPath);
        console.log('Production: Loaded from', indexPath);
      } else {
        // Development: load from Vite dev server
        await mainWindow.loadURL('http://localhost:5173');
        console.log('Development: Loaded from Vite dev server');
      }
    } catch (err) {
      console.error('Failed to load URL:', err);
    }
  };
  
  loadURL();
  
  // Open DevTools only in development
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  // Log any errors
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('✅ Page finished loading successfully');
  });

  // Log console messages from renderer
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console] ${message}`);
  });

  // Detect crashes
  mainWindow.webContents.on('render-process-gone', (event, details) => {
    console.error('❌ Renderer process gone!', details);
  });

  mainWindow.webContents.on('crashed', (event, killed) => {
    console.error('❌ Renderer crashed!', { killed });
  });

  mainWindow.on('closed', () => {
    console.log('Window closed event');
    mainWindow = null;
  });

  // Block DevTools shortcuts in production (F12, Ctrl+Shift+I, etc.)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    // Block F12
    if (input.key === 'F12') {
      event.preventDefault();
    }
    // Block Ctrl+Shift+I (DevTools)
    if (input.control && input.shift && input.key === 'I') {
      event.preventDefault();
    }
    // Block Ctrl+Shift+J (Console)
    if (input.control && input.shift && input.key === 'J') {
      event.preventDefault();
    }
    // Block Ctrl+Shift+C (Inspect)
    if (input.control && input.shift && input.key === 'C') {
      event.preventDefault();
    }
  });

  // Verhindere dass DevTools über andere Wege geöffnet werden
  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
    
    // Entferne Rechtsklick-Menü in Production
    mainWindow.webContents.on('context-menu', (event) => {
      event.preventDefault();
    });
  }

  // Prevent window from closing on error
  mainWindow.on('unresponsive', () => {
    console.log('Window became unresponsive');
  });

  // Log when window is closing
  mainWindow.on('close', (event) => {
    console.log('Window close event triggered');
    console.log('forceQuit:', forceQuit);
    
    if (!forceQuit) {
      event.preventDefault();
      console.log('❌ Close prevented! Window will stay open.');
      console.log('Use the X button in the title bar to close.');
      return false;
    }
    console.log('✅ Force quit enabled, allowing close');
  });
}

// ====================================================================
// ELECTRON AUTO-UPDATER SETUP
// ====================================================================
// Nur für Production Builds (nicht in Dev-Mode)
if (!app.isPackaged) {
  console.log('⚠️  Running in DEV mode - AutoUpdater disabled');
} else {
  console.log('🔄 Production mode - Setting up AutoUpdater');
  
  // GitHub Releases Feed URL
  const feedURL = `https://github.com/99Problemsx/mirrorbytes-launcher/releases/latest/download`;
  
  try {
    autoUpdater.setFeedURL({
      provider: 'github',
      owner: '99Problemsx',
      repo: 'mirrorbytes-launcher',
      releaseType: 'release'
    });
    
    console.log('✅ AutoUpdater feed configured');
    
    // Check for updates on startup (after 10 seconds)
    setTimeout(() => {
      console.log('🔍 Checking for launcher updates...');
      autoUpdater.checkForUpdates();
    }, 10000);
    
  } catch (error) {
    console.error('❌ Failed to setup AutoUpdater:', error);
  }

  // AutoUpdater Events
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-status', { 
        status: 'checking',
        message: 'Suche nach Launcher-Updates...'
      });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('✨ Update available!', info);
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-status', { 
        status: 'available',
        version: info.version,
        message: `Launcher-Update verfügbar: v${info.version}`
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('✅ Launcher is up to date!', info);
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-status', { 
        status: 'up-to-date',
        message: 'Launcher ist aktuell'
      });
    }
  });

  autoUpdater.on('download-progress', (progress) => {
    console.log(`⬇️  Download progress: ${progress.percent.toFixed(2)}%`);
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-progress', {
        percent: progress.percent,
        transferred: progress.transferred,
        total: progress.total,
        speed: progress.bytesPerSecond
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('✅ Update downloaded! Will install on restart.', info);
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-status', { 
        status: 'downloaded',
        version: info.version,
        message: 'Update heruntergeladen - Neu starten zum Installieren'
      });
    }
  });

  autoUpdater.on('error', (error) => {
    console.error('❌ AutoUpdater error:', error);
    if (mainWindow) {
      mainWindow.webContents.send('launcher-update-status', { 
        status: 'error',
        message: 'Update-Fehler: ' + error.message
      });
    }
  });
}

app.whenReady().then(() => {
  console.log('Electron app is ready');
  console.log('App path:', app.getAppPath());
  console.log('Preload path:', path.join(__dirname, 'preload.js'));
  
  // Initialize services
  mysteryGiftService = getMysteryGiftService();
  
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('All windows closed');
  // NEVER quit automatically - only when user explicitly closes via X button
  // This prevents accidental closing
  console.log('Prevented automatic quit - window will stay open');
});

app.on('activate', () => {
  console.log('App activated');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Log app events
app.on('will-quit', () => {
  console.log('App will quit');
});

app.on('before-quit', () => {
  console.log('App before quit');
  forceQuit = true;
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection at:', promise, 'reason:', reason);
});

// IPC Handlers
ipcMain.handle('window:minimize', () => {
  console.log('Minimize requested');
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  console.log('Maximize requested');
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  console.log('Close requested via IPC');
  forceQuit = true;
  mainWindow?.close();
  app.quit();
});

ipcMain.handle('game:launch', async (event, gameId) => {
  try {
    const gamePath = getGamePath(gameId);
    if (!gamePath) {
      throw new Error('Game not found');
    }

    // Launch the game
    const gameProcess = spawn(gamePath, [], {
      detached: true,
      stdio: 'ignore'
    });

    gameProcess.unref();
    
    return { success: true, message: 'Game launched successfully' };
  } catch (error) {
    console.error('Error launching game:', error);
    return { success: false, message: error.message };
  }
});

ipcMain.handle('game:getPath', (event, gameId) => {
  return getGamePath(gameId);
});

ipcMain.handle('file:read', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content;
  } catch (error) {
    console.error('Error reading file:', error);
    return null;
  }
});

ipcMain.handle('game:getInstallPath', (event, gameId) => {
  // Return just the installation directory without Game.exe
  return GAME_CONFIGS[gameId]?.installPath || null;
});

function getGamePath(gameId) {
  // Game paths configuration
  // Standard installation path for players
  return GAME_CONFIGS[gameId]?.exePath || null;
}

function getGameRepo(gameId) {
  return GAME_CONFIGS[gameId]?.repo || 'Illusion'; // fallback
}

ipcMain.handle('settings:get', () => {
  // TODO: Load settings from file
  return {
    language: 'de',
    theme: 'dark',
    autoUpdate: true
  };
});

ipcMain.handle('settings:save', (event, settings) => {
  // TODO: Save settings to file
  console.log('Saving settings:', settings);
  return { success: true };
});

// Open external URLs (for GitHub releases, etc.)
ipcMain.handle('shell:openExternal', async (event, url) => {
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('Error opening external URL:', error);
    return { success: false, error: error.message };
  }
});

// Open save folder in explorer
ipcMain.handle('shell:openSaveFolder', async (event, gameId) => {
  try {
    const saveFolder = path.join(getGameInstallBase(), GAME_CONFIGS[gameId]?.saveFolder || 'Pokemon Illusion', 'Saves');
    
    // Create folder if it doesn't exist
    try {
      await fs.mkdir(saveFolder, { recursive: true });
    } catch (mkdirError) {
      // Folder might already exist, that's fine
    }
    
    shell.openPath(saveFolder);
    return { success: true };
  } catch (error) {
    console.error('Failed to open save folder:', error);
    return { success: false, error: error.message };
  }
});

// Open any path in explorer
ipcMain.handle('shell:openPath', async (event, folderPath) => {
  try {
    console.log('Opening path in explorer:', folderPath);
    
    // Check if path exists
    try {
      await fs.access(folderPath);
    } catch (err) {
      throw new Error('Pfad existiert nicht');
    }
    
    // Open folder in explorer
    await shell.openPath(folderPath);
    return { success: true };
  } catch (error) {
    console.error('Error opening path:', error);
    return { success: false, error: error.message };
  }
});

// Uninstall game
ipcMain.handle('game:uninstall', async (event, gameId) => {
  try {
    console.log('🗑️ Starting uninstall for game:', gameId);
    
    const installDir = GAME_CONFIGS[gameId]?.installPath || path.join(getGameInstallBase(), 'Pokemon Illusion');
    
    // Check if directory exists
    try {
      await fs.access(installDir);
    } catch (err) {
      console.log('Game not installed or already removed');
      return { success: true, message: 'Spiel ist nicht installiert' };
    }
    
    console.log('📁 Deleting directory:', installDir);
    
    // Delete the entire installation directory
    await fs.rm(installDir, { recursive: true, force: true });
    
    console.log('✅ Uninstall completed successfully!');
    return { success: true, message: 'Spiel erfolgreich deinstalliert!' };
  } catch (error) {
    console.error('❌ Error uninstalling game:', error);
    return { success: false, message: error.message };
  }
});

// Check if file exists
ipcMain.handle('file:exists', async (event, filePath) => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
});

// Download game from GitHub
ipcMain.handle('game:download', async (event, gameId) => {
  try {
    const repo = getGameRepo(gameId);
    console.log('🚀 Starting download for game:', gameId);
    console.log('📦 Fetching latest release from: https://github.com/99Problemsx/' + repo + '/releases');
    
    // Get latest release from GitHub
    const ghHeaders = {
      'User-Agent': 'Mirrorbytes-Launcher'
    };
    if (process.env.GITHUB_TOKEN) {
      ghHeaders['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }
    const response = await fetch('https://api.github.com/repos/99Problemsx/' + repo + '/releases/latest', { headers: ghHeaders });
    
    if (!response.ok) {
      // If rate limited, provide reset info when available
      if (response.status === 403) {
        const reset = response.headers.get('x-ratelimit-reset');
        let resetMsg = '';
        if (reset) {
          const resetDate = new Date(parseInt(reset, 10) * 1000);
          resetMsg = ` Rate limit resets at ${resetDate.toLocaleString()}.`;
        }
        throw new Error(`GitHub API returned 403: rate limit exceeded.${resetMsg} Consider setting GITHUB_TOKEN environment variable with a personal access token to increase rate limits.`);
      }
      throw new Error(`GitHub API returned ${response.status}: ${response.statusText}`);
    }
    
    const release = await response.json();
    console.log('✅ Found release:', release.tag_name, '-', release.name);
    console.log('📋 Available assets:', release.assets.map(a => a.name).join(', '));
    
    // Check if we have an installed version for patch updates
    const installDir = GAME_CONFIGS[gameId]?.installPath || path.join(getGameInstallBase(), 'Pokemon Illusion');
    let installedVersion = null;
    
    try {
      const versionPath = path.join(installDir, 'VERSION.txt');
      const versionContent = await fs.readFile(versionPath, 'utf-8');
      installedVersion = versionContent.trim();
      console.log('📌 Installed version detected:', installedVersion);
    } catch (err) {
      console.log('📌 No installed version found (fresh install)');
    }
    
    // Try to find patch asset if we have an installed version
    let asset = null;
    let isPatchUpdate = false;

    if (installedVersion) {
      const patchAssetName = `Patch-from-${installedVersion}.zip`;
      asset = release.assets.find(a => a.name.includes(patchAssetName));

      if (asset) {
        console.log('✨ Patch update available:', asset.name, `(${(asset.size / 1024 / 1024).toFixed(2)} MB)`);
        console.log('💾 Bandwidth savings vs full download!');
        isPatchUpdate = true;
      } else {
        console.log('📦 No patch available, will download full version');
      }
    }
    
    // Fall back to full download if no patch found
    if (!asset) {
      // Prioritize .exe, then .zip (but skip patch zips)
      asset = release.assets.find(a => 
        a.name.toLowerCase().endsWith('.exe') && 
        !a.name.includes('Patch-from')
      );
      
      if (!asset) {
        asset = release.assets.find(a => 
          a.name.toLowerCase().endsWith('.zip') && 
          !a.name.includes('Patch-from')
        );
      }
    }
    
    if (!asset) {
      // No .exe/.zip asset found in the release assets - try zipball/tarball fallback
      const fallbackUrl = release.zipball_url || release.tarball_url;
      if (fallbackUrl) {
        try {
          const fallbackName = `${repo}-${release.tag_name || 'latest'}-source.zip`;
          const fallbackPath = path.join(installDir, fallbackName);
          console.log('🔁 No release asset; attempting fallback download from:', fallbackUrl);

          await new Promise((res, rej) => {
            // Do NOT set Accept here — GitHub's API will return 415 when Accept is application/octet-stream
            // For zipball/tarball endpoints, request with only a User-Agent so GitHub replies with a 302 redirect
            https.get(fallbackUrl, {
              headers: {
                'User-Agent': 'Mirrorbytes-Launcher'
              }
            }, (response) => {
              if (response.statusCode === 302 || response.statusCode === 301) {
                console.log('↪️ Following redirect to:', response.headers.location);
                https.get(response.headers.location, (redirectResp) => {
                  const out = fsSync.createWriteStream(fallbackPath);
                  redirectResp.pipe(out);
                  out.on('finish', () => out.close(res));
                  out.on('error', rej);
                }).on('error', rej);
                return;
              }
              if (response.statusCode !== 200) return rej(new Error(`Fallback download failed with status ${response.statusCode}`));
              const out = fsSync.createWriteStream(fallbackPath);
              response.pipe(out);
              out.on('finish', () => out.close(res));
              out.on('error', rej);
            }).on('error', rej);
          });

          console.log('✅ Fallback downloaded to', fallbackPath);
          console.log('📦 Extracting fallback zip to', installDir);
          const AdmZipClass = getAdmZip();
          if (!AdmZipClass) {
            throw new Error('adm-zip module not available');
          }
          const zip = new AdmZipClass(fallbackPath);
          zip.extractAllTo(installDir, true);
          try { await fs.unlink(fallbackPath); } catch (e) { console.warn('Could not delete fallback zip:', e.message); }

          const gameExePath = path.join(installDir, 'Game.exe');
          const gameExists = fsSync.existsSync(gameExePath);
          console.log('🎮 Game.exe exists after fallback extraction:', gameExists);

          return { success: true, path: gameExePath, extracted: true, message: 'Fallback zip downloaded and extracted' };
        } catch (err) {
          console.warn('⚠️ Fallback download/extract failed:', err.message);
          // If fallback fails, fall through to throw the informative error below
        }
      }

      console.error('❌ No suitable asset found in release');
      throw new Error(`Keine Game.exe oder .zip Datei im neuesten Release gefunden.\n\nUm das Spiel herunterzuladen:\n1. Gehe zu: https://github.com/99Problemsx/${repo}/releases/tag/${release.tag_name}\n2. Klicke auf "Edit" (Bearbeiten)\n3. Lade deine Spiel-Zip-Datei als Asset hoch\n4. Aktualisiere das Release\n\nAlternativ kannst du das Spiel manuell installieren.`);
    }

    console.log('📥 Selected asset:', asset.name, `(${(asset.size / 1024 / 1024).toFixed(2)} MB)`);

    const downloadUrl = asset.browser_download_url;
    const fileName = asset.name;
    const fileSize = asset.size;
    const isZipFile = fileName.toLowerCase().endsWith('.zip');
    
    // installDir already declared above, reuse it
    
    // Create directory if it doesn't exist
    try {
      await fs.mkdir(installDir, { recursive: true });
      console.log('📁 Installation directory ready:', installDir);
    } catch (err) {
      console.error('❌ Error creating directory:', err);
      throw err;
    }
    
    const downloadPath = path.join(installDir, fileName);
    
    console.log('🌐 Download URL:', downloadUrl);
    console.log('💾 Saving to:', downloadPath);
    console.log('📊 File size:', (fileSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('📦 Is ZIP file:', isZipFile);
    
    // Download with progress
    return new Promise((resolve, reject) => {
      https.get(downloadUrl, {
        headers: {
          'User-Agent': 'Mirrorbytes-Studio',
          'Accept': 'application/octet-stream'
        }
      }, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          console.log('↪️ Following redirect to:', response.headers.location);
          https.get(response.headers.location, (redirectResponse) => {
            handleDownload(redirectResponse, downloadPath, fileSize, installDir, isZipFile, event, resolve, reject);
          }).on('error', reject);
        } else if (response.statusCode === 200) {
          handleDownload(response, downloadPath, fileSize, installDir, isZipFile, event, resolve, reject);
        } else {
          reject(new Error(`Download failed with status ${response.statusCode}`));
        }
      }).on('error', (error) => {
        console.error('❌ Download request error:', error);
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ Error downloading game:', error);
    return { success: false, message: error.message };
  }
});

function handleDownload(response, downloadPath, fileSize, installDir, isZipFile, event, resolve, reject) {
  const file = fsSync.createWriteStream(downloadPath);
  let downloadedBytes = 0;
  let lastProgress = 0;
  
  console.log('⬇️ Starting file stream...');
  
  response.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const progress = Math.floor((downloadedBytes / fileSize) * 100);
    
    // Only send progress updates every 1% to avoid spam
    if (progress > lastProgress) {
      lastProgress = progress;
      
      // Send progress update to renderer
      if (mainWindow) {
        mainWindow.webContents.send('download:progress', progress);
      }
      
      // Log every 10%
      if (progress % 10 === 0) {
        console.log(`📊 Download progress: ${progress}% (${(downloadedBytes / 1024 / 1024).toFixed(2)} MB / ${(fileSize / 1024 / 1024).toFixed(2)} MB)`);
      }
    }
  });
  
  response.pipe(file);
  
  file.on('finish', async () => {
    file.close();
    console.log('✅ Download completed successfully!');
    console.log('💾 File saved to:', downloadPath);
    
    // If it's a ZIP file, extract it automatically
    if (isZipFile) {
      try {
        console.log('📦 ZIP file detected, starting extraction...');
        
        // Send extraction progress to renderer
        if (mainWindow) {
          mainWindow.webContents.send('download:progress', 100);
          mainWindow.webContents.send('download:extracting', true);
        }
        
        const AdmZipClass = getAdmZip();
        if (!AdmZipClass) {
          throw new Error('adm-zip module not available');
        }
        const zip = new AdmZipClass(downloadPath);
        const zipEntries = zip.getEntries();
        
        console.log('📋 ZIP contains', zipEntries.length, 'files');
        console.log('📂 Extracting to:', installDir);
        
        // Extract all files to installation directory
        zip.extractAllTo(installDir, true);
        
        console.log('✅ Extraction completed!');
        
        // Delete the ZIP file after extraction
        try {
          await fs.unlink(downloadPath);
          console.log('🗑️ Deleted ZIP file:', downloadPath);
        } catch (err) {
          console.warn('⚠️ Could not delete ZIP file:', err.message);
        }
        
        // Check if Game.exe exists after extraction
        const gameExePath = path.join(installDir, 'Game.exe');
        const gameExists = fsSync.existsSync(gameExePath);
        
        console.log('🎮 Game.exe exists after extraction:', gameExists);
        console.log('📍 Expected path:', gameExePath);
        
        if (mainWindow) {
          mainWindow.webContents.send('download:extracting', false);
        }
        
        resolve({ 
          success: true, 
          path: gameExePath,
          extracted: true,
          message: 'Download und Extraktion erfolgreich abgeschlossen!' 
        });
      } catch (error) {
        console.error('❌ Extraction error:', error);
        reject(new Error(`ZIP-Extraktion fehlgeschlagen: ${error.message}`));
      }
    } else {
      // Not a ZIP file, just return success
      resolve({ 
        success: true, 
        path: downloadPath,
        extracted: false,
        message: 'Download erfolgreich abgeschlossen!' 
      });
    }
  });
  
  file.on('error', (error) => {
    console.error('❌ File write error:', error);
    fsSync.unlink(downloadPath, () => {});
    reject(error);
  });
  
  response.on('error', (error) => {
    console.error('❌ Response stream error:', error);
    file.close();
    fsSync.unlink(downloadPath, () => {});
    reject(error);
  });
}

// ============================================================================
// DISCORD RICH PRESENCE HANDLERS
// ============================================================================

ipcMain.handle('discord:initialize', async () => {
  try {
    if (!discordService) {
      discordService = getDiscordService();
    }
    const result = await discordService.initialize();
    return { success: result };
  } catch (error) {
    console.error('Discord init failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:get-status', async () => {
  if (!discordService) {
    return { connected: false, enabled: false };
  }
  return {
    connected: discordService.isConnected,
    enabled: discordService.isConnected
  };
});

ipcMain.handle('discord:enable', async () => {
  try {
    if (!discordService) {
      discordService = getDiscordService();
    }
    await discordService.initialize();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:disable', async () => {
  try {
    if (discordService) {
      await discordService.disconnect();
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('discord:set-activity', async (event, type, data, selectedGame = null) => {
  try {
    if (!discordService || !discordService.isConnected) {
      throw new Error('Discord not connected');
    }
    
    if (type === 'launcher') {
      discordService.setLauncherActivity(selectedGame);
    } else if (type === 'game') {
      discordService.setGameActivity(data, selectedGame);
    } else {
      // Füge selectedGame-Info zu data hinzu
      if (selectedGame) {
        data.gameId = selectedGame.id;
        data.gameName = selectedGame.name;
        data.selectedGame = selectedGame;
      }
      discordService.setCustomActivity(type, data);
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ============================================================================
// MYSTERY GIFT HANDLERS
// ============================================================================

ipcMain.handle('mysterygift:save', async (event, redeemedCodes) => {
  try {
    if (!mysteryGiftService) {
      mysteryGiftService = getMysteryGiftService();
    }
    const success = await mysteryGiftService.saveGiftsForGame(redeemedCodes);
    return { success };
  } catch (error) {
    console.error('Failed to save mystery gifts:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('mysterygift:check-claimed', async (event, code) => {
  try {
    if (!mysteryGiftService) {
      mysteryGiftService = getMysteryGiftService();
    }
    const claimed = await mysteryGiftService.isGiftClaimed(code);
    return { claimed };
  } catch (error) {
    console.error('Failed to check mystery gift:', error);
    return { claimed: false };
  }
});

// ============================================================================
// AUTO-UPDATE HANDLERS
// ============================================================================

// Launcher Auto-Update (Electron AutoUpdater)
ipcMain.handle('launcher:check-update', async () => {
  try {
    if (!app.isPackaged) {
      return { 
        success: false, 
        message: 'Auto-Update nur in Production verfügbar' 
      };
    }
    
    console.log('🔍 Checking for launcher updates...');
    await autoUpdater.checkForUpdates();
    return { success: true, message: 'Update-Check gestartet' };
  } catch (error) {
    console.error('Launcher update check failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('launcher:install-update', async () => {
  try {
    if (!app.isPackaged) {
      return { 
        success: false, 
        message: 'Auto-Update nur in Production verfügbar' 
      };
    }
    
    console.log('🔄 Installing launcher update and restarting...');
    autoUpdater.quitAndInstall();
    return { success: true };
  } catch (error) {
    console.error('Launcher update install failed:', error);
    return { success: false, error: error.message };
  }
});

// Game Auto-Update (existing system)
ipcMain.handle('updates:check', async () => {
  try {
    if (!autoUpdateService) {
      autoUpdateService = getAutoUpdateService('Illusion'); // Launcher updates from Illusion repo
      autoUpdateService.initialize(mainWindow);
    }
    const result = await autoUpdateService.checkForUpdates(false);
    return result;
  } catch (error) {
    console.error('Update check failed:', error);
    return null;
  }
});

ipcMain.handle('updates:download', async (event, updateInfo) => {
  try {
    if (!autoUpdateService) {
      throw new Error('Update service not initialized');
    }
    
    // Get install path from somewhere (could be from settings)
    const installPath = GAME_CONFIGS[gameId]?.installPath || path.join(getGameInstallBase(), 'Pokemon Illusion');
    
    await autoUpdateService.downloadUpdate(updateInfo, installPath);
    return { success: true };
  } catch (error) {
    console.error('Update download failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('updates:rollback', async (event, installPath) => {
  try {
    if (!autoUpdateService) {
      autoUpdateService = getAutoUpdateService();
    }
    await autoUpdateService.rollback(installPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Initialize services on app ready
app.whenReady().then(() => {
  // Initialize Discord RPC
  setTimeout(() => {
    discordService = getDiscordService();
    discordService.initialize().catch(err => {
      console.log('Discord RPC not available:', err.message);
    });
  }, 3000);
  
  // Initialize Auto-Update (will be done when window is ready)
});

// Cleanup on quit
app.on('before-quit', async () => {
  if (discordService) {
    await discordService.disconnect();
  }
  if (autoUpdateService) {
    autoUpdateService.stopPeriodicChecks();
  }
});
