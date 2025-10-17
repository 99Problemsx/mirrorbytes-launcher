# 🎮 Discord Rich Presence - Multi-Game Update

## ✨ Was ist neu?

### 🎯 Separate Discord Applications

Der Launcher verwendet jetzt **separate Discord Applications für jedes Spiel**:

- ✅ **Illusion** → Discord App ID: `1428590219430461602`
- ⏳ **Zorua** → Noch zu erstellen (Anleitung verfügbar)
- 🎮 **Launcher** → Zeigt "Mirrorbytes Studio"

### 🔄 Automatischer App-Wechsel

Der Service wechselt automatisch zwischen den Discord Apps:

```javascript
// Launcher startet → Illusion/Launcher App
await discordService.setLauncherActivity()

// Illusion startet → Illusion App
await discordService.setGameActivity(info, { id: 'illusion' })

// Zorua startet → Zorua App
await discordService.setGameActivity(info, { id: 'zorua' })
```

---

## 📁 Neue Dateien

### 1. `.env` - Discord Configuration
```bash
# launcher-electron/.env
DISCORD_CLIENT_ID_ZORUA=your_app_id_here
```
⚠️ **Wird NICHT in Git committed** (in .gitignore)

### 2. `DISCORD_SETUP.md` - Vollständige Anleitung
- Schritt-für-Schritt Discord App Setup
- Asset Upload Guide
- Troubleshooting
- Best Practices

### 3. `DISCORD_README.md` - Quick Reference
- Aktuelle Konfiguration
- Quick Start Guide
- Asset Checkliste
- Testing Kommandos

---

## 🔧 Code Änderungen

### `discordService.js` - Komplett überarbeitet

**Vorher:**
```javascript
constructor() {
  this.client = null;
  this.clientId = process.env.DISCORD_CLIENT_ID || '1234...';
}

async initialize() {
  // Ein Client für alles
}
```

**Nachher:**
```javascript
constructor() {
  this.clients = new Map(); // Map für mehrere Clients
  this.currentClient = null;
  this.currentGameId = null;
  
  this.gameClients = {
    illusion: { id: '1428590219430461602', ... },
    zorua: { id: process.env.DISCORD_CLIENT_ID_ZORUA, ... },
    launcher: { id: '1428590219430461602', ... }
  };
}

async initialize(gameId = 'launcher') {
  // Dynamischer Client-Wechsel
  // Disconnect von altem Game
  // Connect zu neuem Game
}
```

**Neue Features:**
- ✅ Multiple Discord RPC Clients gleichzeitig verwalten
- ✅ Automatischer Wechsel beim Game-Start
- ✅ Separate Assets pro Spiel
- ✅ Bessere Error Handling
- ✅ Disconnect von vorherigem Game beim Wechsel

---

## 🎨 Asset Management

### Pro Discord Application benötigt:

**Required:**
- `{game}_logo` - Hauptlogo (512x512)
- `mirrorbytes_logo` - Studio Logo (512x512)
- `launcher_icon` - Kleines Icon (128x128)

**Optional:**
- Activity Icons (battle, gym, training, etc.)
- Map Icons (Kanto, Johto, etc.)

### Upload Location:
```
Discord Developer Portal
→ Your Application
→ Rich Presence
→ Art Assets
→ Add Image(s)
```

---

## 📋 Setup Schritte

### Für Illusion (bereits konfiguriert):

1. ✅ Discord App erstellt
2. ⏳ Assets hochladen:
   - `illusion_logo`
   - `mirrorbytes_logo`
   - `launcher_icon`
   - Optional: weitere Icons

### Für Zorua (noch zu tun):

1. ⏳ Neue Discord App erstellen:
   ```
   https://discord.com/developers/applications
   → New Application
   → Name: "Zorua - The Divine Deception"
   ```

2. ⏳ Application ID kopieren

3. ⏳ In `.env` eintragen:
   ```bash
   DISCORD_CLIENT_ID_ZORUA=deine_app_id
   ```

4. ⏳ Assets hochladen:
   - `zorua_logo`
   - `mirrorbytes_logo`
   - `launcher_icon`
   - Optional: weitere Icons

---

## 🧪 Testing

### Manuelle Tests:

1. **Launcher starten:**
   ```bash
   cd launcher-electron
   npm run dev
   ```

2. **Discord öffnen**

3. **Rich Presence überprüfen:**
   - Im Launcher → "Im Mirrorbytes Studio"
   - Illusion starten → "Spielt Illusion"
   - Zorua starten → "Spielt Zorua"

4. **Zwischen Games wechseln:**
   - Prüfe, ob Discord App automatisch wechselt
   - Icons sollten sich ändern
   - Name sollte sich ändern

### Console Logs:

```bash
# Erfolgreiche Verbindung
✅ Discord Rich Presence connected for Illusion!
✅ Discord activity updated (illusion): Spielt Illusion

# App Wechsel
✅ Discord RPC disconnected (illusion)
✅ Discord Rich Presence connected for Zorua!
✅ Discord activity updated (zorua): Spielt Zorua
```

---

## 🐛 Bekannte Issues

### Issue 1: Assets nicht sichtbar
**Problem:** Discord zeigt keine Bilder an  
**Lösung:** Assets benötigen 5-10 Minuten nach Upload

### Issue 2: Zorua App nicht konfiguriert
**Problem:** `⚠️ Discord Rich Presence for zorua not configured`  
**Lösung:** 
1. Zorua Discord App erstellen
2. ID in `.env` eintragen: `DISCORD_CLIENT_ID_ZORUA=...`
3. Launcher neu starten

### Issue 3: Beide Games gleicher Name
**Problem:** Illusion und Zorua zeigen gleichen Discord Namen  
**Lösung:** Separate Zorua App erstellen (temporär teilen sie sich eine App)

---

## 🚀 Vorteile der neuen Lösung

### ✅ Bessere User Experience:
- Jedes Spiel hat eigenen Discord Namen
- Separate Icons und Branding
- Klarere Anzeige was gespielt wird

### ✅ Professioneller:
- Sauber getrennte Applications
- Eigene Assets pro Spiel
- Leichter zu verwalten

### ✅ Skalierbar:
- Neue Spiele einfach hinzufügen
- Jedes Spiel kann eigene Activities haben
- Unabhängige Asset-Verwaltung

### ✅ Flexibel:
- Verschiedene Discord Servers pro Game möglich
- Unterschiedliche Buttons/Links
- Game-spezifische Features

---

## 📊 Migration Roadmap

### Phase 1: Setup (Jetzt) ✅
- [x] Code umgestellt auf Multi-Client System
- [x] Illusion App ID konfiguriert
- [x] `.env` System eingerichtet
- [x] Dokumentation geschrieben

### Phase 2: Illusion Assets (To Do) ⏳
- [ ] `illusion_logo` hochladen
- [ ] `mirrorbytes_logo` hochladen
- [ ] `launcher_icon` hochladen
- [ ] Optional: Activity Icons
- [ ] Testen in Discord

### Phase 3: Zorua Setup (To Do) ⏳
- [ ] Neue Discord Application erstellen
- [ ] App ID in `.env` eintragen
- [ ] Assets hochladen
- [ ] Testen in Discord

### Phase 4: Deployment ⏳
- [ ] `.env` auf Build-Server konfigurieren
- [ ] Production Build testen
- [ ] Release erstellen

---

## 🔗 Hilfreiche Links

- **Discord Developer Portal:** https://discord.com/developers/applications
- **Illusion App:** https://discord.com/developers/applications/1428590219430461602
- **Discord RPC Docs:** https://discord.com/developers/docs/rich-presence/overview
- **Setup Guide:** [DISCORD_SETUP.md](./DISCORD_SETUP.md)
- **Quick Reference:** [DISCORD_README.md](./DISCORD_README.md)

---

## ✅ Checkliste

### Sofort:
- [x] Code implementiert
- [x] `.env` Dateien erstellt
- [x] Dokumentation geschrieben
- [ ] `.env` zu .gitignore hinzugefügt ✅

### Nächste Schritte:
- [ ] Illusion Discord App Assets hochladen
- [ ] Zorua Discord App erstellen
- [ ] Zorua App ID in `.env` eintragen
- [ ] Zorua Assets hochladen
- [ ] Both Apps testen

### Deployment:
- [ ] `.env` auf CI/CD konfigurieren
- [ ] Production Build
- [ ] Release v1.1.0

---

*Erstellt: {{ date }}*  
*Status: Code ✅ | Illusion Assets ⏳ | Zorua App ⏳*
