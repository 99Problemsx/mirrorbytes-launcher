# 🚀 Build & Deployment Guide - Mirrorbytes Studio

Vollständige Anleitung zum Bauen, Veröffentlichen und Updaten des Launchers.

---

## 📋 Voraussetzungen

### Entwicklungsumgebung

- **Node.js**: v18+ ([Download](https://nodejs.org/))
- **npm**: v9+ (kommt mit Node.js)
- **Git**: Für Version Control

### Windows Build (empfohlen)

- **Windows 10/11**: 64-bit
- **Visual Studio Build Tools**: (wird automatisch installiert)

### Optional

- **Docker**: Für Linux-Builds auf Windows
- **Wine**: Für Windows-Builds auf Linux/Mac

---

## 🎯 Quick Start

### 1. Dependencies installieren

```bash
cd launcher-electron
npm install
```

### 2. Discord Client ID einrichten

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Erstelle eine neue Application
3. Kopiere die **Application ID**
4. Erstelle `.env` Datei:

```bash
# .env
DISCORD_CLIENT_ID=1234567890123456789
```

5. Upload Rich Presence Assets:
   - Gehe zu **Rich Presence** → **Art Assets**
   - Upload `mirrorbytes_logo.png` (512x512)
   - Upload `illusion_icon.png` (512x512)
   - Upload `zorua_icon.png` (512x512)
   - Asset Key muss exakt mit dem Namen im Code übereinstimmen!

---

## 🏗️ Build-Prozess

### Development Build testen

```bash
npm run dev
```

### Production Build erstellen

#### Windows (NSIS Installer + Portable)

```bash
npm run build:win
```

**Output:**

- `dist-electron/Mirrorbytes Studio-1.0.0-Setup.exe` (Installer)
- `dist-electron/Mirrorbytes Studio-1.0.0-Portable.exe` (Portable Version)

#### macOS (DMG + ZIP)

```bash
npm run build:mac
```

#### Linux (AppImage + DEB)

```bash
npm run build:linux
```

---

## 📦 Build-Dateien Struktur

Nach dem Build findest du die Dateien hier:

```
launcher-electron/
├── dist-electron/
│   ├── Mirrorbytes Studio-1.0.0-Setup.exe       # 🎯 Installer (empfohlen)
│   ├── Mirrorbytes Studio-1.0.0-Portable.exe    # 🎒 Portable Version
│   ├── latest.yml                                 # Auto-Update Info
│   └── builder-debug.yml                          # Build Debug Info
```

---

## 🎮 Installer vs. Portable

### Installer (NSIS) - Empfohlen für Distribution

✅ **Vorteile:**

- Automatische Updates
- Desktop & Startmenü Shortcuts
- Saubere Deinstallation
- Professionelle User Experience

❌ **Nachteile:**

- Benötigt Installation
- Schreibrechte erforderlich

### Portable Version

✅ **Vorteile:**

- Keine Installation nötig
- Läuft von USB-Stick
- Keine Admin-Rechte nötig

❌ **Nachteile:**

- Keine automatischen Updates
- Keine Shortcuts
- Manuelle Updates nötig

---

## 🔄 Auto-Update System

### Wie funktioniert Auto-Update?

1. **Launcher startet** → Prüft auf Updates
2. **Update gefunden** → Zeigt Notification
3. **User klickt "Update"** → Download im Hintergrund
4. **Download fertig** → Installiert beim nächsten Start

### Update-Konfiguration

Die Update-Prüfung erfolgt über GitHub Releases:

```javascript
// electron-builder automatisch konfiguriert
publish: {
  provider: 'github',
  owner: '99Problemsx',
  repo: 'mirrorbytes-launcher'
}
```

### Neues Update veröffentlichen

#### Schritt 1: Version erhöhen

```bash
# In package.json
{
  "version": "1.0.1"  // <- Version erhöhen
}
```

#### Schritt 2: Build erstellen

```bash
npm run build:win
```

#### Schritt 3: GitHub Release erstellen

**Option A: Manuell**

1. Gehe zu GitHub Repository
2. **Releases** → **Create new release**
3. Tag: `v1.0.1`
4. Release Title: `Mirrorbytes Studio v1.0.1`
5. Beschreibung:

   ```markdown
   ## 🎉 Was ist neu?

   - ✨ Feature: Multi-Language Support (Deutsch/English)
   - 🎮 Feature: Verbesserte Discord Rich Presence
   - 🐛 Fix: Sidebar Scrollbar entfernt
   - 🔧 Verbesserung: Performance-Optimierungen

   ## 📥 Downloads

   - **Windows Installer (empfohlen)**: `Mirrorbytes Studio-1.0.1-Setup.exe`
   - **Windows Portable**: `Mirrorbytes Studio-1.0.1-Portable.exe`
   ```

6. Upload Dateien:

   - `Mirrorbytes Studio-1.0.1-Setup.exe`
   - `Mirrorbytes Studio-1.0.1-Portable.exe`
   - `latest.yml` (WICHTIG!)

7. **Publish release** ✅

**Option B: Automatisch (GitHub Actions)**

Erstelle `.github/workflows/build-release.yml`:

```yaml
name: Build & Release

on:
  push:
    tags:
      - "v*"

jobs:
  release:
    runs-on: windows-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Dependencies
        run: |
          cd launcher-electron
          npm ci

      - name: Build
        run: |
          cd launcher-electron
          npm run build:win
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Release
        uses: softprops/action-gh-release@v1
        with:
          files: |
            launcher-electron/dist-electron/*.exe
            launcher-electron/dist-electron/latest.yml
          draft: false
          prerelease: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Dann einfach:

```bash
git tag v1.0.1
git push --tags
```

#### Schritt 4: Testen

1. Alte Version des Launchers starten
2. Sollte Update-Notification anzeigen
3. Auf "Update herunterladen" klicken
4. Launcher neu starten → Update wird installiert

---

## 🛠️ Troubleshooting

### Build-Fehler

#### "electron-builder not found"

```bash
npm install --save-dev electron-builder
```

#### "Icon not found"

Stelle sicher, dass `build/icon.ico` existiert.

Du kannst ein Icon erstellen:

1. Erstelle 512x512 PNG
2. Konvertiere zu ICO: https://convertio.co/png-ico/

#### "Code signing failed"

Für Development Builds:

```json
"win": {
  "sign": null
}
```

### Auto-Update funktioniert nicht

#### Checkliste:

- [ ] `latest.yml` ist im GitHub Release hochgeladen
- [ ] Release ist als "Latest" markiert
- [ ] Repository ist public ODER Token konfiguriert
- [ ] Version in `package.json` ist höher als installierte Version
- [ ] Release-Tag hat Format `v1.0.0` (mit v!)

#### Debug-Modus aktivieren

```javascript
// In electron/main.js
autoUpdater.logger = require("electron-log");
autoUpdater.logger.transports.file.level = "info";
```

---

## 📊 Build-Größen

Ungefähre Dateigrößen:

- **Installer (NSIS)**: ~150-200 MB
- **Portable**: ~200-250 MB
- **Unpacked**: ~300-400 MB

Größe hängt ab von:

- Node Modules
- Electron Runtime
- Game Assets (Icons, Images)

---

## 🚀 Deployment Workflow

### Kompletter Release-Prozess:

```bash
# 1. Features entwickeln
git checkout -b feature/new-feature
# ... code changes ...
git commit -m "feat: New feature"
git push

# 2. Merge to main
git checkout main
git merge feature/new-feature

# 3. Version erhöhen
# In package.json: "version": "1.0.1"
git commit -am "chore: Bump version to 1.0.1"

# 4. Tag erstellen
git tag -a v1.0.1 -m "Release v1.0.1"
git push origin v1.0.1

# 5. Build lokal (oder GitHub Actions macht es)
npm run build:win

# 6. Release auf GitHub erstellen
# Upload: .exe Files + latest.yml

# 7. Fertig! 🎉
# Users bekommen automatisch Update-Notification
```

---

## 🔐 Code Signing (Optional, aber empfohlen)

Für Production Releases solltest du den Code signieren:

### Windows Code Signing Certificate kaufen:

- **Sectigo**: ~$85/Jahr
- **DigiCert**: ~$470/Jahr

### Certificate konfigurieren:

```json
"win": {
  "certificateFile": "cert.pfx",
  "certificatePassword": "process.env.CSC_PASSWORD"
}
```

```bash
# Environment Variable setzen
set CSC_PASSWORD=your_password
npm run build:win
```

**Ohne Code Signing** → Windows SmartScreen Warnung

---

## 📝 Checkliste vor Release

- [ ] Version in `package.json` erhöht
- [ ] `CHANGELOG.md` aktualisiert
- [ ] Alle Tests laufen durch
- [ ] Build funktioniert: `npm run build:win`
- [ ] Discord Client ID konfiguriert
- [ ] Icons sind vorhanden (`build/icon.ico`)
- [ ] `latest.yml` wird generiert
- [ ] GitHub Release erstellt
- [ ] Dateien hochgeladen (`.exe` + `latest.yml`)
- [ ] Release Notes geschrieben
- [ ] Release als "Latest" markiert

---

## 🎯 Best Practices

### Versioning (Semantic Versioning)

- **Major (1.0.0 → 2.0.0)**: Breaking Changes
- **Minor (1.0.0 → 1.1.0)**: Neue Features
- **Patch (1.0.0 → 1.0.1)**: Bugfixes

### Release Zyklus

- **Major**: Alle 6-12 Monate
- **Minor**: Alle 1-2 Monate
- **Patch**: Nach Bedarf (Bugfixes)

### Testing vor Release

```bash
# 1. Development Build testen
npm run dev

# 2. Production Build lokal testen
npm run build:win
# → Installiere die .exe und teste

# 3. Auto-Update testen
# → Installiere alte Version
# → Veröffentliche neue Version
# → Prüfe ob Update erkannt wird
```

---

## 🆘 Support & Hilfe

### Electron Builder Docs

https://www.electron.build/

### Auto-Update Guide

https://www.electron.build/auto-update

### GitHub Releases

https://docs.github.com/en/repositories/releasing-projects-on-github

---

## 💡 Tipps & Tricks

### Build-Zeit reduzieren

```bash
# Nur für aktuelles OS bauen
npm run build:win  # Statt npm run build (baut alle Plattformen)
```

### Debug Build

```bash
# Build ohne Compression (schneller)
npm run build:win -- --dir
```

### Portable Version priorisieren

```bash
# Nur Portable bauen
electron-builder --win portable
```

---

**Viel Erfolg beim Bauen und Veröffentlichen! 🚀**

Bei Fragen: GitHub Issues oder Discord Server
