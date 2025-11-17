# 🎨 Icon Erstellen für Mirrorbytes Studio

## Option 1: Online Tool (Empfohlen - 5 Minuten)

### 1. Erstelle/Besorge ein Bild

- PNG Format, 512x512 oder 1024x1024
- Transparenter Hintergrund empfohlen
- Mirrorbytes Studio Logo

### 2. Konvertiere zu ICO

Gehe zu: **https://convertio.co/de/png-ico/**

1. Lade dein PNG hoch
2. Zielformat: ICO
3. Größe: 512x512 (oder Auto)
4. Konvertiere
5. Downloade die ICO Datei

### 3. Platziere Icon

```bash
# Speichere als:
launcher-electron/build/icon.ico
```

---

## Option 2: Mit existierendem Launcher Icon

Falls du bereits ein Launcher-Icon hast:

```bash
# Kopiere von:
dein-icon.png

# Nach:
launcher-electron/build/icon.ico
# (konvertiere vorher zu ICO mit convertio.co)
```

---

## Option 3: Temporäres Icon (Für Test-Build)

Verwende ein placeholder Icon für jetzt:

1. Gehe zu: https://icon-icons.com/icon/game/152634
2. Downloade als ICO
3. Speichere in `launcher-electron/build/icon.ico`

---

## Anforderungen

### Windows (.ico):

- Format: ICO
- Größen: 16x16, 32x32, 48x48, 256x256
- Empfohlen: 512x512
- Multi-size ICO bevorzugt

### macOS (.icns):

- Format: ICNS
- Benötigt nur für Mac builds
- Konvertierung: https://cloudconvert.com/png-to-icns

### Linux (.png):

- Format: PNG
- Größe: 512x512 oder 1024x1024
- Transparenter Hintergrund

---

## Nach Icon-Erstellung

Wenn Icon bereit ist:

```bash
cd launcher-electron
npm run build:win
```

Dann findest du:

- `dist-electron/Mirrorbytes Studio-1.0.0-Setup.exe` (Installer)
- `dist-electron/Mirrorbytes Studio-1.0.0-Portable.exe` (Portable)
- `dist-electron/latest.yml` (Auto-Update manifest)

---

## Schnell-Lösung

**Für sofortigen Build ohne eigenes Icon:**

Ich erstelle ein einfaches Text-basiertes Icon als Placeholder!
