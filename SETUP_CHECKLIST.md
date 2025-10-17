# 🚀 Mirrorbytes Studio - Setup Checkliste

## ✅ Bereits erledigt:

- [x] Multi-Language Support (Deutsch/English) erstellt
- [x] Build-Konfiguration für Installer & Portable
- [x] Discord Integration vorbereitet
- [x] Build-Guide Dokumentation
- [x] NSIS Installer Customization
- [x] Release Notes Template
- [x] Auto-Update System konfiguriert

## 📋 Noch zu tun:

### 1. i18n Integration in Components (WICHTIG!)

Die Translation-Dateien sind erstellt, aber müssen noch in die React-Components integriert werden.

**Beispiel - wie es sein sollte:**

```jsx
import { useTranslation } from "../i18n";

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <h1>{t("app.welcome")}</h1> // statt "Willkommen..."
  );
};
```

**Betroffene Dateien:**

- `src/App.jsx` - Wrap in LanguageProvider
- `src/components/Sidebar.jsx` - Navigation Labels
- `src/components/GameCard.jsx` - Button Texte
- `src/components/Settings.jsx` - Language Selector hinzufügen
- `src/components/DiscordPage.jsx`
- `src/components/AchievementsPage.jsx`
- Alle anderen Component-Dateien

### 2. Discord Client ID Setup

```bash
# .env Datei erstellen:
DISCORD_CLIENT_ID=<deine_client_id>
```

1. Gehe zu https://discord.com/developers/applications
2. Create Application
3. Kopiere Application ID
4. Füge in .env ein
5. Upload Rich Presence Icons

### 3. Build Icons erstellen

Benötigt: `build/icon.ico` (Windows)

**Option A - Online konvertieren:**

1. Erstelle 512x512 PNG Logo
2. Gehe zu https://convertio.co/png-ico/
3. Speichere als `launcher-electron/build/icon.ico`

**Option B - Photoshop/GIMP:**

1. Erstelle 512x512 Bild
2. Export as ICO mit Multiple Sizes

### 4. Ersten Build erstellen

```bash
cd launcher-electron
npm install
npm run build:win
```

Output: `dist-electron/Mirrorbytes Studio-1.0.0-Setup.exe`

### 5. GitHub Release erstellen

1. GitHub → Releases → New Release
2. Tag: `v1.0.0`
3. Upload:
   - `Mirrorbytes Studio-1.0.0-Setup.exe`
   - `Mirrorbytes Studio-1.0.0-Portable.exe`
   - `latest.yml` (WICHTIG für Auto-Update!)
4. Release Notes aus `RELEASE_NOTES_1.0.0.md` kopieren
5. Publish Release

### 6. Auto-Update testen

1. Installiere v1.0.0
2. Erstelle v1.0.1
3. Release auf GitHub
4. Launcher sollte Update anzeigen

---

## 🎯 Schnellstart für Development

```bash
# 1. Repo klonen (falls noch nicht geschehen)
git clone https://github.com/99Problemsx/mirrorbytes-launcher.git
cd mirrorbytes-launcher/launcher-electron

# 2. Dependencies installieren
npm install

# 3. Discord Client ID konfigurieren (optional)
echo "DISCORD_CLIENT_ID=your_id_here" > .env

# 4. Entwicklungsserver starten
npm run dev

# 5. Production Build testen
npm run build:win
```

---

## 🔧 Nächste Schritte (Priorität)

### Priorität 1 (Kritisch):

1. **i18n in App.jsx integrieren** - LanguageProvider wrap
2. **Icon erstellen** - `build/icon.ico`
3. **Discord Client ID** - `.env` Datei

### Priorität 2 (Wichtig):

4. **Settings Page erweitern** - Language Selector UI
5. **Alle Components übersetzen** - t() Funktion nutzen
6. **Ersten Build testen** - `npm run build:win`

### Priorität 3 (Nice to have):

7. **GitHub Actions** - Automatische Builds
8. **Code Signing** - Certificate kaufen (optional)
9. **macOS/Linux Builds** - Multi-Platform

---

## 📖 Hilfreiche Commands

```bash
# Development
npm run dev                 # Dev-Server starten

# Building
npm run build              # Production build (alle Dateien)
npm run build:win          # Nur Windows
npm run build:mac          # Nur macOS
npm run build:linux        # Nur Linux

# Testing
npm test                   # Tests laufen lassen
npm run lint               # Code-Qualität prüfen

# Cleaning
rm -rf dist dist-electron  # Build-Ordner löschen
rm -rf node_modules        # Dependencies löschen
npm install                # Neu installieren
```

---

## 🐛 Troubleshooting

### Build schlägt fehl?

```bash
# Dependencies neu installieren
rm -rf node_modules package-lock.json
npm install

# Cache leeren
npm cache clean --force
```

### Icon nicht gefunden?

Stelle sicher dass `build/icon.ico` existiert!

### Auto-Update funktioniert nicht?

Checke:

- `latest.yml` ist im GitHub Release
- Version in `package.json` ist höher
- Release ist als "Latest" markiert

---

## 📚 Weitere Dokumentation

- **BUILD_GUIDE.md** - Vollständiger Build & Deployment Guide
- **RELEASE_NOTES_1.0.0.md** - Release Notes Template
- **README.md** - Projekt-Übersicht

---

## 💡 Tipps

### Schneller entwickeln:

- Hot-Reload ist aktiviert im Dev-Mode
- Änderungen werden sofort sichtbar
- Electron wird automatisch neu geladen

### Production-Build testen:

1. Build erstellen: `npm run build:win`
2. Installer ausführen
3. App testen wie End-User sie sieht

### Performance:

- Vite ist sehr schnell
- Erste Build dauert länger
- Weitere Builds sind inkrementell

---

**Status**: ✅ Grundlagen fertig, Integration in Components noch ausstehend

**Nächster Schritt**: i18n in App.jsx integrieren & LanguageProvider wrapper
