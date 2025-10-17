# 🚀 Pokémon Illusion Launcher - Quick Start

Der offizielle Game Launcher mit Auto-Update-Funktionalität!

## ✨ Features

- ✅ Auto-Update für das Spiel (von GitHub Releases)
- ✅ Launcher aktualisiert sich selbst automatisch
- ✅ Modernes UI mit Fortschrittsanzeige
- ✅ Cross-Platform (Windows & macOS)
- ✅ Download-Verwaltung mit Geschwindigkeitsanzeige

## 📥 Download & Installation

### Windows

1. Lade `Illusion-Launcher-Setup.exe` von [Releases](https://github.com/99Problemsx/Illusion/releases)
2. Führe den Installer aus
3. Starte über Startmenü oder Desktop-Icon

### macOS

1. Lade `Illusion-Launcher.dmg` von [Releases](https://github.com/99Problemsx/Illusion/releases)
2. Öffne die DMG und ziehe die App in den Programme-Ordner
3. Rechtsklick → "Öffnen" beim ersten Start

## 🛠️ Für Entwickler

### Voraussetzungen

- Node.js 18+ 
- npm

### Installation

```bash
cd launcher
npm install
```

### Development Mode

```bash
npm run dev
```

Der Launcher öffnet sich automatisch mit Hot-Reload für React.

### Production Build

```bash
# Für aktuelles OS
npm run build

# Spezifisch
npm run build:win    # Windows
npm run build:mac    # macOS
```

### Projektstruktur

```
launcher/
├── src/
│   ├── main.ts           # Electron Main Process
│   ├── preload.ts        # IPC Bridge
│   ├── App.tsx           # React UI
│   ├── types.ts          # TypeScript Types
│   └── services/
│       ├── GameUpdater.ts      # Game Updates
│       └── LauncherUpdater.ts  # Launcher Self-Update
├── build/                # Icons & Assets
└── dist/                 # Build Output
```

## 📖 Mehr Infos

Siehe [launcher/README.md](launcher/README.md) für vollständige Dokumentation.

---

**Made with ❤️ by 99Problemsx**
