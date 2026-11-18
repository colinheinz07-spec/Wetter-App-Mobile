# Wetter-App-Mobile

Schlankes App-Projekt für die Entwicklung in **SPCK**. Hier liegt **nur der Wetter-App-Code**; keine mehrgigabytegroßen Wetterraster, keine automatischen Datenimporte und keine alten Modellläufe.

## In SPCK verwenden

1. In SPCK ein neues Projekt per **Git Clone** erstellen.
2. Als Git-URL `https://github.com/colinheinz07-spec/Wetter-App-Mobile.git` verwenden.
3. Den Branch `main` nutzen. Hier kannst du ganz normal bearbeiten, committen, fetchen und pushen.
4. Das bisherige große SPCK-Projekt erst löschen, wenn die neue Kopie geprüft und alle lokalen Änderungen gesichert sind.

## Daten- und Code-Trennung

- **Wetter-App-Mobile** (dieses Repository): `index.html`, `assets/`, Bedienelemente, Wetterdarstellung, Straßenwetter und Pegel.
- **Wetter-App** (Daten-Repository): `https://github.com/colinheinz07-spec/Wetter-App` – Wettermodell-Vorhersagen, Radar, Kartenraster und GitHub-Actions-Datenimporte.
- Die App lädt benötigte Wetterdaten online aus dem bisherigen Daten-Repository bzw. amtlichen Schnittstellen. Sie braucht die großen Datendateien nicht im lokalen SPCK-Projekt.
- **Entwicklung ab jetzt:** Änderungen an der App-Oberfläche gehören hier auf `main`. Neue Wettermodell-Importer und Hintergrund-Daten gehören ins ursprüngliche Wetter-App-Repository. Kein automatisches gegenseitiges Überschreiben der beiden `main`-Branches.

## Funktionen

- Aktuelle ortsbezogene Wetterwerte und Stundenverlauf
- 7-Tage-Prognosen und Warnungen
- Wettermodellkarten, Radar und Expertenbereich
- Straßenwetter (amtliche DWD-SWSMOS-Prognosen von nahegelegenen Stationen)
- Hochwasser/Pegelstände (WSV PEGELONLINE, soweit verfügbar)

Bei fehlenden Daten sind amtliche Informationsangebote maßgeblich. Der Gefahrenbereich ist kein Ersatz für amtliche Warnungen oder Straßensperrungen.

**Wichtig:** `data/` gehört nicht in dieses Projekt; die Git-Ignore-Datei schützt vor versehentlichem Hinzufügen lokaler Modelldaten. Alle bisherigen großen Daten und ihre Git-Historie bleiben im ursprünglichen Repository erhalten.

## Code-Struktur

Die Oberfläche liegt in `index.html`, die vollständige bisherige Wetterlogik unverändert in `assets/app.js`, das Grundlayout in `assets/base.css`, die neue Gestaltung in `assets/mobile-design.css`. Karten-Geografie und Gefahrenbereich bleiben eigenständige Dateien. Der Code wird beim Laden in dieser Reihenfolge eingebunden; **keine** Wetterdaten werden in SPCK eingecheckt.

Qualitätsprüfung auf GitHub: `node scripts/check-mobile.cjs` und Chromium-Tests unter `.github/workflows/mobile-ui.yml`.
