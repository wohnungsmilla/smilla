# Wohnung Smilla - Ferienwohnung in Flensburg

Eine moderne, responsive Website für die Ferienwohnung Smilla in Flensburg. Die Website bietet eine interaktive Buchungsanfrage mit Kalender, Bildergalerie und detaillierten Informationen über die Unterkunft.

## Features

- 📅 **Interaktiver Buchungskalender** - Verfügbarkeitsprüfung und Buchungsanfrage
- 🖼️ **Bildergalerie** - Hochwertige Fotos der Wohnung und Umgebung
- 📱 **Responsive Design** - Optimiert für Desktop, Tablet und Mobile
- 💰 **Kostenberechnung** - Automatische Preisberechnung basierend auf Gästezahl und Aufenthaltsdauer
- 📧 **Formspree Integration** - Direkte Buchungsanfragen per E-Mail
- 🗺️ **Standortinformationen** - Details über Flensburg und Umgebung

## Technologie

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Styling**: Custom CSS mit CSS Grid und Flexbox
- **Formulare**: Formspree für E-Mail-Versand
- **Deployment**: GitHub Pages mit GitHub Actions

## Lokale Entwicklung

1. Repository klonen:
```bash
git clone https://github.com/wohnungsmilla/smilla.git
cd smilla
```

2. Lokalen Server starten:
```bash
# Mit Python
python -m http.server 8000

# Oder mit Node.js
npx serve .

# Oder mit Go (falls installiert)
go run server.go
```

3. Website im Browser öffnen: `http://localhost:8000`

## Deployment

Die Website wird automatisch über GitHub Pages deployed. Jeder Push zum `main` Branch löst eine neue Deployment aus.

**Live Website**: https://wohnungsmilla.github.io/smilla

## Struktur

```
smilla/
├── css/                    # Stylesheets
├── js/                     # JavaScript-Dateien
├── images/                 # Bilder und Icons
│   ├── background/         # Hintergrundbilder
│   └── smilla/            # Wohnungsfotos
├── index.html             # Hauptseite
├── legal.html             # Impressum und Datenschutz
└── server.go              # Go-Server für lokale Entwicklung
```

## Kontakt

- **E-Mail**: wohnungsmilla@gmail.com
- **Telefon**: +49 151 53793837
- **Adresse**: Friedastraße 19, 24937 Flensburg

## Lizenz

© 2025 Wohnung Smilla. Alle Rechte vorbehalten.
