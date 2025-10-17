# Mirrorbytes Studio - Multi-Game Launcher

<div align="center">

![Electron](https://img.shields.io/badge/Electron-Latest-47848F?style=for-the-badge&logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)

**Modern Multi-Game Launcher for Pokémon Fangames**

[📖 Documentation](https://github.com/99Problemsx/mirrorbytes-launcher/tree/main) [🌐 Website](https://99problemsx.github.io/mirrorbytes-launcher/) [💬 Discussions](https://github.com/99Problemsx/mirrorbytes-launcher/discussions) [⬇️ Download Release](https://github.com/99Problemsx/mirrorbytes-launcher/releases/latest)

</div>

---

## Mirrorbytes Studio

Ein moderner, benutzerfreundlicher Launcher für **mehrere Pokémon Fangames**:

- **Multi-Game Support** - Verwalte mehrere Spiele
- **Auto-Updates** - Automatische Spiel-Updates
- **GitHub Integration** - Direkte Downloads & Changelogs
- **Discord Rich Presence** - Zeige, was du spielst
- **Achievements & Rewards** - Sammle Erfolge
- **Mystery Gifts** - Löse Codes ein

## Installation

### Option 1: Download Release (Empfohlen)

**Für Spieler** - Fertiges, spielbares Game:

1. Gehe zu [Releases](https://github.com/99Problemsx/Mirrorbytes/releases/latest)
2. Lade `Mirrorbytes-vX.X.X.zip` herunter
3. Entpacke das Archiv
4. Starte `Game.exe`

### Option 2: Clone Repository

**Für Entwickler** - Kompletter Source Code:

```bash
# Game Branch clonen
git clone --single-branch --branch game https://github.com/99Problemsx/Mirrorbytes.git
cd Mirrorbytes

# RPG Maker XP benötigt (oder MKXP-Z für moderne Systeme)
```

## Entwicklung

### Voraussetzungen

- **RPG Maker XP** oder **MKXP-Z Runtime**
- **Ruby 3.0+** (für Plugins)
- **Pokémon Essentials v21+** (bereits enthalten)

### Projekt Struktur

```
Mirrorbytes/
 PBS/              # Pokémon Battle System Files
 Plugins/          # Custom Ruby Scripts
 Graphics/         # All Visual Assets
    Battlers/     # Pokémon Sprites
    Characters/   # Overworld Sprites
    Tilesets/     # Map Tilesets
    UI/           # User Interface
 Audio/            # Music & SFX
    BGM/          # Background Music
    BGS/          # Background Sounds
    ME/           # Music Effects
    SE/           # Sound Effects
 Data/             # Compiled Game Data
 Animations/       # Battle Animations
 Fonts/            # Custom Fonts
```

### Debugging

1. Öffne das Projekt in RPG Maker XP
2. Drücke F12 für ein Soft Reset
3. Nutze das Debug Menü (F9 im Test Mode)

## Updates

Automatische Updates werden über den **main Branch** verwaltet:

- CI/CD Pipelines
- Automated Testing
- Release Management

## Ressourcen

- [ **Main Branch**](https://github.com/99Problemsx/Illusion/tree/main) - Dokumentation & CI/CD
- [ **Website**](https://99problemsx.github.io/Illusion/) - Pokédex, FAQ, Team
- [ **Wiki**](https://github.com/99Problemsx/Illusion/wiki) - Guides & Tutorials
- [ **Discussions**](https://github.com/99Problemsx/Illusion/discussions) - Community Q&A

## Contributing

Entwickler-Guide im [main Branch](https://github.com/99Problemsx/Illusion/tree/main):

- [CONTRIBUTING.md](https://github.com/99Problemsx/Illusion/blob/main/.github/CONTRIBUTING.md) - How to Contribute
- [Code of Conduct](https://github.com/99Problemsx/Illusion/blob/main/.github/CODE_OF_CONDUCT.md)
- [Security Policy](https://github.com/99Problemsx/Illusion/blob/main/.github/SECURITY.md)

## License

Pokémon und alle zugehörigen Namen sind Handelsmarken von Nintendo, Game Freak und Creatures Inc.

Dieses Projekt ist ein **nicht-kommerzielles Fan-Projekt**.

Siehe [LICENSE](LICENSE) für Details zum verwendeten Code.

---

<div align="center">

**[ Zurück zum Main Branch](https://github.com/99Problemsx/Illusion/tree/main)**

Made with using Pokémon Essentials v21+

</div>
