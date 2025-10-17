# 🎮 Discord Rich Presence - Quick Reference

## 📋 Aktuelle Konfiguration

### ✅ Illusion Discord App

```
Application ID: 1428590219430461602
Public Key:     16e279b12300f2e9bbdf83816405c4fa7713e57401da0e6a02023b55ffb0d3da
Status:         Konfiguriert ✓
```

**Portal:** https://discord.com/developers/applications/1428590219430461602

### ⏳ Zorua Discord App

```
Status: Noch zu erstellen ⚠️
```

**Nächste Schritte:**

1. Erstelle neue Discord Application: [Discord Developer Portal](https://discord.com/developers/applications)
2. Name: "Zorua - The Divine Deception"
3. Kopiere Application ID
4. Trage in `.env` ein: `DISCORD_CLIENT_ID_ZORUA=deine_id`

---

## 🚀 Quick Start

### 1. Assets hochladen (Illusion)

```
Portal: https://discord.com/developers/applications/1428590219430461602
→ Rich Presence → Art Assets
```

**Benötigte Assets:**

- `illusion_logo` (512x512) - Hauptlogo
- `mirrorbytes_logo` (512x512) - Studio Logo
- `launcher_icon` (128x128) - Kleines Icon

### 2. Zorua App erstellen

```
1. https://discord.com/developers/applications → New Application
2. Name: "Zorua - The Divine Deception"
3. Kopiere Application ID
4. In launcher-electron/.env:
   DISCORD_CLIENT_ID_ZORUA=deine_id
```

### 3. Assets hochladen (Zorua)

```
Portal: https://discord.com/developers/applications/[ZORUA_APP_ID]
→ Rich Presence → Art Assets
```

**Benötigte Assets:**

- `zorua_logo` (512x512) - Hauptlogo
- `mirrorbytes_logo` (512x512) - Studio Logo
- `launcher_icon` (128x128) - Kleines Icon

---

## 📁 Wichtige Dateien

```
launcher-electron/
├── .env                           # Deine Discord App IDs (NICHT committen!)
├── .env.example                   # Vorlage mit Anleitung
└── src/services/discordService.js # Discord Integration Code

DISCORD_SETUP.md                   # Vollständige Anleitung
```

---

## 🎨 Asset Checkliste

### Required (pro App):

- [ ] `{game}_logo` - Hauptbild (512x512)
- [ ] `mirrorbytes_logo` - Studio Logo (512x512)
- [ ] `launcher_icon` - Kleines Icon (128x128)

### Optional (beide Apps):

- [ ] `playing_icon` - Spiel läuft
- [ ] `menu_icon` - Im Menü
- [ ] `battle_icon` - Im Kampf
- [ ] `gym_icon` - Arena Kampf
- [ ] `pokeball` - Pokémon fangen
- [ ] Map Icons (Kanto, Johto, etc.)

---

## 🔧 Testing

### Testen im Launcher:

1. Starte Launcher: `cd launcher-electron && npm run dev`
2. Öffne Discord
3. Überprüfe Rich Presence
4. Wechsle zwischen Games
5. Teste verschiedene Activities

### Console Logs:

```
✅ Discord Rich Presence connected for Illusion!
✅ Discord activity updated (illusion): Spielt Illusion
```

---

## 📚 Weitere Infos

**Vollständige Anleitung:** [DISCORD_SETUP.md](./DISCORD_SETUP.md)
**Discord Docs:** https://discord.com/developers/docs/rich-presence/overview

---

## ⚡ Schnell-Kommandos

```bash
# Assets prüfen
curl https://discord.com/api/v10/applications/1428590219430461602/rpc

# .env erstellen (falls nicht vorhanden)
cp launcher-electron/.env.example launcher-electron/.env

# Launcher starten
cd launcher-electron && npm run dev

# Build mit Discord Support
npm run build:win
```

---

_Status: Illusion App ✓ | Zorua App ⏳_
