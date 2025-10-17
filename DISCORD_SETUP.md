# 🎮 Discord Rich Presence Setup Guide - Multi-Game Support

## 📋 Übersicht

Mirrorbytes Studio verwendet **separate Discord Applications** für jedes Spiel, um eine optimale Rich Presence Experience zu bieten:

- **Illusion** → Eigene Discord App mit eigenem Icon und Assets
- **Zorua - The Divine Deception** → Eigene Discord App mit eigenem Icon und Assets
- **Launcher** → Zeigt "Mirrorbytes Studio" wenn kein Spiel läuft

## 🎯 Warum separate Discord Apps?

✅ **Vorteile:**

- Jedes Spiel erscheint mit eigenem Namen und Icon in Discord
- Separate Rich Presence Assets (Maps, Icons, Badges)
- Professionelleres und klareres Erscheinungsbild
- Bessere Organisation und Verwaltung
- Spieler sehen sofort welches Spiel läuft

❌ **Ohne separate Apps:**

- Alle Games teilen sich einen Namen
- Schwierig verschiedene Assets zu verwalten
- Weniger professionell

---

## 🚀 Quick Start

### Schritt 1: Illusion Discord App (✅ Bereits eingerichtet)

Die Illusion App ist bereits konfiguriert:

- **Application ID:** `1428590219430461602`
- **Public Key:** `16e279b12300f2e9bbdf83816405c4fa7713e57401da0e6a02023b55ffb0d3da`

**Du musst nur noch:**

1. Gehe zu [Discord Developer Portal](https://discord.com/developers/applications)
2. Wähle die Application "Illusion" (ID: 1428590219430461602)
3. Gehe zu **Rich Presence** → **Art Assets**
4. Lade die Assets hoch (siehe unten)

### Schritt 2: Zorua Discord App (❗ Noch zu erstellen)

1. **Erstelle neue Application:**

   ```
   https://discord.com/developers/applications
   → "New Application"
   → Name: "Zorua - The Divine Deception"
   → Create
   ```

2. **Kopiere Application ID:**

   - Auf der Application Seite findest du die **Application ID**
   - Kopiere diese ID

3. **Trage ID in .env ein:**

   ```bash
   # In launcher-electron/.env
   DISCORD_CLIENT_ID_ZORUA=deine_zorua_app_id_hier
   ```

4. **Lade Assets hoch:**
   - Gehe zu **Rich Presence** → **Art Assets**
   - Lade die Assets hoch (siehe unten)

---

## 🎨 Rich Presence Assets

### 📦 Benötigte Assets pro Game

Lade diese Bilder im Discord Developer Portal hoch (Rich Presence → Art Assets):

#### Für ILLUSION App:

| Asset Name         | Typ   | Größe   | Beschreibung            |
| ------------------ | ----- | ------- | ----------------------- |
| `illusion_logo`    | Large | 512x512 | Hauptlogo von Illusion  |
| `mirrorbytes_logo` | Large | 512x512 | Mirrorbytes Studio Logo |
| `launcher_icon`    | Small | 128x128 | Kleines Launcher Icon   |
| `playing_icon`     | Small | 128x128 | Icon wenn Spiel läuft   |
| `menu_icon`        | Small | 128x128 | Menü Icon               |
| `battle_icon`      | Small | 128x128 | Kampf Icon              |
| `gym_icon`         | Small | 128x128 | Arena Icon              |
| `training_icon`    | Small | 128x128 | Training Icon           |
| `trade_icon`       | Small | 128x128 | Tausch Icon             |
| `explore_icon`     | Small | 128x128 | Exploration Icon        |
| `pokeball`         | Small | 128x128 | Pokéball Icon           |

#### Für ZORUA App:

| Asset Name                     | Typ   | Größe   | Beschreibung            |
| ------------------------------ | ----- | ------- | ----------------------- |
| `zorua_logo`                   | Large | 512x512 | Hauptlogo von Zorua     |
| `mirrorbytes_logo`             | Large | 512x512 | Mirrorbytes Studio Logo |
| `launcher_icon`                | Small | 128x128 | Kleines Launcher Icon   |
| _(gleiche Icons wie Illusion)_ |       |         |                         |

#### Optional: Maps (für beide Apps)

| Asset Name       | Typ   | Größe   | Beschreibung      |
| ---------------- | ----- | ------- | ----------------- |
| `map_kanto`      | Small | 256x256 | Kanto Region Map  |
| `map_johto`      | Small | 256x256 | Johto Region Map  |
| `map_hoenn`      | Small | 256x256 | Hoenn Region Map  |
| `map_sinnoh`     | Small | 256x256 | Sinnoh Region Map |
| _(weitere Maps)_ | Small | 256x256 | Weitere Regionen  |

---

## 📸 Asset Upload Anleitung

### Schritt-für-Schritt:

1. **Gehe zu Discord Developer Portal:**

   ```
   https://discord.com/developers/applications
   ```

2. **Wähle deine Application:**

   - Für Illusion: Application ID `1428590219430461602`
   - Für Zorua: Deine neue Application

3. **Öffne Rich Presence:**

   - Linke Sidebar → **Rich Presence**
   - Klicke auf **Art Assets**

4. **Assets hochladen:**

   ```
   1. Klicke "Add Image(s)"
   2. Wähle dein Bild aus (PNG empfohlen)
   3. Gib den Asset Name ein (z.B. "illusion_logo")
   4. Upload
   5. Wiederhole für alle Assets
   ```

5. **Wichtig:**
   - Asset Names müssen EXAKT übereinstimmen (Groß-/Kleinschreibung!)
   - Verwende Unterstriche `_` statt Leerzeichen
   - PNG Format mit Transparenz empfohlen

---

## 🖼️ Bild-Anforderungen

### Empfohlene Spezifikationen:

```
Large Images (Logos):
├─ Größe: 512x512 oder 1024x1024
├─ Format: PNG mit Transparenz
├─ Dateigröße: < 5MB
└─ Verwendung: Hauptbild in Discord

Small Images (Icons):
├─ Größe: 128x128 oder 256x256
├─ Format: PNG mit Transparenz
├─ Dateigröße: < 2MB
└─ Verwendung: Kleines Icon unten rechts
```

### ✨ Design Tipps:

- **Hoher Kontrast** - Gut sichtbar auf dunklem/hellem Discord Theme
- **Klare Formen** - Icons werden sehr klein angezeigt
- **Transparenter Hintergrund** - Sieht professioneller aus
- **Konsistenter Stil** - Alle Icons im gleichen Design
- **Erkennbares Branding** - Logo sollte sofort erkennbar sein

---

## 🔧 Technische Details

### Wie funktioniert Multi-Game Support?

Der Launcher wechselt automatisch zwischen den Discord Applications:

```javascript
// Im Launcher
await discordService.setLauncherActivity()
// → Verwendet launcher/illusion App

// Wenn Illusion startet
await discordService.setGameActivity(gameInfo, { id: 'illusion', ... })
// → Wechselt zu Illusion App

// Wenn Zorua startet
await discordService.setGameActivity(gameInfo, { id: 'zorua', ... })
// → Wechselt zu Zorua App
```

### Discord Application IDs:

```javascript
// In discordService.js
gameClients: {
  illusion: {
    id: '1428590219430461602',
    name: 'Illusion',
    enabled: true
  },
  zorua: {
    id: process.env.DISCORD_CLIENT_ID_ZORUA,
    name: 'Zorua - The Divine Deception',
    enabled: !!process.env.DISCORD_CLIENT_ID_ZORUA
  }
}
```

---

## 🎮 Rich Presence Beispiele

### Launcher Activity:

```
┌─────────────────────────────────┐
│ Im Mirrorbytes Studio           │
│ Bereit zum Spielen              │
│                                 │
│ [Mirrorbytes Logo]              │
└─────────────────────────────────┘
```

### Illusion Gameplay:

```
┌─────────────────────────────────┐
│ Spielt Illusion                 │
│ Route 1 - Kanto • 3 Orden       │
│                                 │
│ [Illusion Logo] [Map Icon]      │
│                                 │
│ [🎮 Game Info] [💬 Discord]     │
└─────────────────────────────────┘
```

### Zorua Gameplay:

```
┌─────────────────────────────────┐
│ Spielt Zorua                    │
│ Darkwood Forest - Illusia       │
│                                 │
│ [Zorua Logo] [Map Icon]         │
│                                 │
│ [🎮 Game Info] [💬 Discord]     │
└─────────────────────────────────┘
```

### Arena Kampf:

```
┌─────────────────────────────────┐
│ Illusion - Arena Kampf          │
│ vs Sabrina • 5 Orden            │
│                                 │
│ [Illusion Logo] [Gym Icon]      │
└─────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Problem: "Discord Rich Presence disabled"

**Lösung:**

1. Überprüfe `.env` Datei:

   ```bash
   # Für Zorua MUSS gesetzt sein
   DISCORD_CLIENT_ID_ZORUA=deine_app_id
   ```

2. Starte Launcher neu nach `.env` Änderungen

3. Überprüfe in Console:
   ```
   ⚠️  Discord Rich Presence for zorua not configured
   → .env Variable fehlt oder falsch
   ```

### Problem: Assets werden nicht angezeigt

**Mögliche Ursachen:**

1. **Falscher Asset Name** - Muss EXAKT übereinstimmen

   ```
   ✅ illusion_logo
   ❌ Illusion_Logo
   ❌ illusion logo
   ```

2. **Asset noch nicht verarbeitet** - Warte 5-10 Minuten nach Upload

3. **Falsche Application** - Asset in falscher Discord App hochgeladen

4. **Cache Problem** - Discord Client neu starten

### Problem: Beide Games zeigen gleichen Namen

**Lösung:**

- Du hast noch keine separate Zorua App erstellt
- Folge "Schritt 2: Zorua Discord App" oben
- Trage die neue ID in `.env` ein

### Problem: "Failed to initialize Discord RPC"

**Mögliche Ursachen:**

1. Discord ist nicht geöffnet
2. Falsche Application ID
3. Discord RPC ist blockiert (Firewall?)

**Lösung:**

1. Discord öffnen
2. Application IDs überprüfen
3. Firewall-Einstellungen prüfen

---

## 📚 Zusätzliche Ressourcen

### Discord Developer Portal:

- **Applications:** https://discord.com/developers/applications
- **Documentation:** https://discord.com/developers/docs/rich-presence/overview
- **Best Practices:** https://discord.com/developers/docs/rich-presence/best-practices

### Asset Erstellung:

**Kostenlose Tools:**

- **Photopea** (Online Photoshop): https://www.photopea.com/
- **GIMP** (Open Source): https://www.gimp.org/
- **Figma** (UI Design): https://www.figma.com/

**Icon Resources:**

- **Flaticon:** https://www.flaticon.com/
- **Icons8:** https://icons8.com/
- **FontAwesome:** https://fontawesome.com/

**Pokémon Assets:**

- **PokéAPI Sprites:** https://pokeapi.co/
- **Bulbapedia:** https://bulbapedia.bulbagarden.net/

---

## ✅ Checkliste

### Initial Setup:

- [ ] Illusion Discord App Assets hochgeladen
- [ ] Zorua Discord App erstellt
- [ ] Zorua App ID in `.env` eingetragen
- [ ] Zorua Discord App Assets hochgeladen
- [ ] Launcher neugestartet
- [ ] Rich Presence in Discord getestet

### Assets Checklist (pro App):

**Required:**

- [ ] `{game}_logo` (Illusion/Zorua)
- [ ] `mirrorbytes_logo`
- [ ] `launcher_icon`

**Recommended:**

- [ ] `playing_icon`
- [ ] `menu_icon`
- [ ] `battle_icon`
- [ ] `gym_icon`
- [ ] `pokeball`

**Optional:**

- [ ] Map Icons (Kanto, Johto, etc.)
- [ ] Training/Trade/Explore Icons
- [ ] Custom Activity Icons

---

## 🎉 Fertig!

Nach dem Setup solltest du:

- ✅ Separate Discord Anzeigen für Illusion und Zorua sehen
- ✅ Spiel-spezifische Logos und Icons haben
- ✅ Professionelle Rich Presence Experience bieten

**Bei Problemen:** Siehe Troubleshooting-Sektion oder öffne ein GitHub Issue!

---

_Erstellt für Mirrorbytes Studio v1.0.0_
_Letzte Aktualisierung: {{ date }}_
