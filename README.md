# Wetter-App-Mobile

Schlankes App-Projekt für die Entwicklung in **SPCK**. Auf `main` liegt der Wetter-App-Code einschließlich eigener Importer; keine großen Wetterraster und keine alten Modellläufe.

## In SPCK verwenden

1. In SPCK ein neues Projekt per **Git Clone** erstellen.
2. Als Git-URL `https://github.com/colinheinz07-spec/Wetter-App-Mobile.git` verwenden.
3. Den Branch `main` nutzen. Hier kannst du ganz normal bearbeiten, committen, fetchen und pushen.
4. Das bisherige große SPCK-Projekt erst löschen, wenn die neue Kopie geprüft und alle lokalen Änderungen gesichert sind.

## Daten- und Code-Trennung

- **Wetter-App-Mobile** (dieses Repository): `index.html`, `assets/`, Bedienelemente, Wetterdarstellung, Straßenwetter und Pegel.
- **Wetter-App** (Daten-Repository): `https://github.com/colinheinz07-spec/Wetter-App` – Wettermodell-Vorhersagen, Radar, Kartenraster und GitHub-Actions-Datenimporte.
- Die App lädt benötigte Wetterdaten online aus dem bisherigen Daten-Repository bzw. amtlichen Schnittstellen. Sie braucht die großen Datendateien nicht im lokalen SPCK-Projekt.
- **Entwicklung ab jetzt:** App-Oberfläche und mobile eigene Beobachtungssysteme gehören hier auf `main`. Die bestehenden Wettermodell-Importer bleiben im ursprünglichen Wetter-App-Repository. Neue mobile Beobachtungsdaten werden ausschließlich in separaten rollierenden Mobile-Datenbranches veröffentlicht. Kein Überschreiben der beiden `main`-Branches.

## Funktionen

- Aktuelle ortsbezogene Wetterwerte und Stundenverlauf
  - Live-Wetter: frische DWD SYNOP-Messwerte einer sehr nahen, höhenverträglichen Station (als Station gekennzeichnet) oder räumliche Analyse mehrerer Messstationen. ICON-D2-RUC und regionale +0-h-Anfangszustände bleiben ausdrücklich getrennt gekennzeichnete modellgestützte Analysen. Positive Prognose-Leads werden nicht als Live-Beobachtung verwendet.
  - Niederschlagsart: DWD HYMEC-NG, abgestimmt auf frische Radarscans; direkte, zeitlich und räumlich passende Bodenmeldungen haben lokal Vorrang. Ohne belastbare Phase bleibt die Niederschlagsart unbekannt. Modellphasen sind nur bei zukünftigen Radarprognosen erlaubt.
  - Tagesbilanz: tatsächliche RADOLAN-Wasseräquivalente aus disjunkten RW-Stunden- und RY-5-Minuten-Intervallen; RY füllt nur fehlende bzw. jüngere RW-Intervalle. Fehlende Rasterzellen werden nicht als null gewertet. Der angezeigte heutige Höchstwert enthält nur den beobachteten Verlauf und noch nicht abgelaufene Prognosewerte. Tatsächliche Teilmengen und Restprognose werden separat angezeigt.
  - Radar-Nowcast: DWD RV bis zur verfügbaren Prognosezeit (max. 120 Minuten), danach Modell. Eine darüber hinausgehende Ereigniszuordnung und Bias-Korrektur ist noch nicht validiert; Prognosen nach dem RV-Horizont werden daher nicht pauschal abgezogen.
- Live-Karten: grüne Landflächen, unabhängige DWD/EUMETSAT-Meteosat-CTH-Wolkenopazität (0,03°) und numerische Radarmessung darüber, auch in der Satellitenansicht. Beide Zeitstempel bleiben getrennt. Grün allein ist kein Sonnenscheinnachweis. Wind und Temperatur nutzen die flächige ICON-D2-RUC +0-h-Analyse (native 2,2-km-Zellen, 0,02° Darstellungsraster, maximal 3,5 km Entfernung zur nächsten nativen Zelle), als messdatengestützte Analyse gekennzeichnet. Bei verzögerter Publikation bleibt die letzte Fläche 90–150 Minuten mit ausdrücklichem Veraltet-Hinweis sichtbar; keine aktuelle Warnableitung daraus. SYNOP bleibt als Messwert und eingeschränkte Ersatzdarstellung erhalten; fehlende Daten werden grau angezeigt.
- Warnungen: tatsächlicher lokaler Luftfrost bereits unter 0 °C (Schwellenprüfung vor Rundung); Beobachtungsflächen aus SYNOP. Regionalmodell-Signale werden vorsorglich lokal gewarnt, unabhängige Modellfamilien nicht doppelt gezählt. Innerhalb dreistündiger Prognoseintervalle werden verfügbare Stundenminima berücksichtigt; Warnflächen sind zusammenhängende Konturen, nicht einzelne Gemeinde- oder Rasterquadrate. Nebel: frische lokale SYNOP-Meldung bzw. gemessene Sicht unter 1000 m mit Sättigung und ohne bekannte Niederschlagsart; separate Risikoflächen aus Taupunktdifferenz bis 1 K, schwachem Wind bis 12 km/h und hoher Feuchte (falls verfügbar ≥94 %). Das Risiko ist kein Nachweis von Nebel oder der tatsächlichen Sichtweite in einer Mulde.
- 7-Tage-Prognosen und Warnungen
- Wettermodellkarten, Radar und Expertenbereich
- Straßenwetter (amtliche DWD-SWSMOS-Prognosen von nahegelegenen Stationen)
- Hochwasser/Pegelstände (WSV PEGELONLINE, soweit verfügbar)

Bei fehlenden Daten sind amtliche Informationsangebote maßgeblich. Der Gefahrenbereich ist kein Ersatz für amtliche Warnungen oder Straßensperrungen.

**Wichtig:** `data/` gehört nicht in dieses Projekt; die Git-Ignore-Datei schützt vor versehentlichem Hinzufügen lokaler Modelldaten. Alle bisherigen großen Daten und ihre Git-Historie bleiben im ursprünglichen Repository erhalten.

## Code-Struktur

Die Oberfläche liegt in `index.html`, Wetterlogik in `assets/app.js`, das Grundlayout in `assets/base.css`, die Gestaltung in `assets/mobile-design.css`. Karten-Geografie und Gefahrenbereich bleiben eigenständige Dateien. **Keine** Wetterdaten werden auf `main` in SPCK eingecheckt.

`assets/observations.js` verwaltet Beobachtungszeit, Stationsabdeckung, historische Temperaturwerte und RADOLAN-Intervalle unabhängig vom Modellcode. `.github/workflows/mobile-observations.yml` startet die drei unabhängigen Importe regelmäßig alle zehn Minuten (GitHub-Zeitplanung kann sich verzögern). Datenquellen: [DWD SYNOP](https://opendata.dwd.de/weather/weather_reports/synoptic/germany/geojson/), [RADOLAN RW](https://opendata.dwd.de/weather/radar/radolan/rw/), [RADOLAN RY](https://opendata.dwd.de/weather/radar/radolan/ry/), [Meteosat CTH](https://opendata.dwd.de/weather/satellite/clouds/CTH/). Daten liegen auf `mobile-observed-surface`, `mobile-radar-history` und `mobile-satellite-cloud`; die flächige +0-h-Analyse auf `mobile-live-data/analysis-map.json.gz`. Die App akzeptiert nur zeitlich und strukturell gültige Pakete. Radar-Historie ist zeilenweise verlustfrei komprimiert für punktuelle Abfragen auf Mobilgeräten.

Qualitätsprüfung auf GitHub: `node scripts/check-mobile.cjs` und Chromium-Tests unter `.github/workflows/mobile-ui.yml`.
