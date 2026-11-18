# Wetter-App-Mobile – Parameter- und Qualitätsprüfung
Stand: 18. November 2026

## Grundsatz
Dies ist **ausschließlich das App-Code-Repository**. Die großen Daten liegen in `colinheinz07-spec/Wetter-App`, überwiegend in laufend ersetzten, eigenständigen `generated-points-*`- und `generated-native-*`-Snapshots. Im Mobile-Repository dürfen keine Modellraster eingecheckt werden.

## Aktuelle Oberflächen
- **Wetter:** Ortsprognose mit laufendem Niederschlags-Radar/Nowcast, Stundenverlauf, rollierenden 6-/24-h-Niederschlagssummen, Wind/Böen, Feuchte, 7-Tage-Prognose in vier Tagesabschnitten. *Gefühlte Temperatur* wird als Windchill oder Hitzeindex ausschließlich bei gültigen meteorologischen Eingangsdaten und Formelbereichen gezeigt. Zusätzlich Taupunktdifferenz, Beaufort, Sonnenaufgang, Sonnenuntergang und Tageslänge (astronomisch berechnet, keine Messung).
- **Modelle/Karten:** Zukunftszeitpunkte, bedarfsgeladene Original-Modellkacheln, Druckflächen, Scherungs- und Konvektionsparameter nach Quellenverfügbarkeit.
- **Warnungen:** automatische, **nicht amtliche** Warnstufen und Zeitfenster. Keine erdachten amtlichen Warnungen.
- **Gefahren:** DWD SWSMOS **stationenbasierte** Straßenwetterprognosen; Wasserstände und teils Vorhersagen über WSV PEGELONLINE, **keine** automatisch erfundenen örtlichen Überschwemmungswarnungen.
- **Experten:** meteorologische Profile, CAPE/CIN/LI, LCL/LFC/EL, PWAT, Scherung/Helizität, Höhenwind und Feuchte auf modellseitig verfügbaren Druckflächen.

## Real vorhandene Felder in den geprüften Original-Manifests
Diese Aufzählung beschreibt die im Datenrepository am Prüfungstag deklarierten Rasterfelder, **nicht** deren lückenlose Verfügbarkeit für jede Stunde und jeden Ort:
- **ICON-D2 / ICON-EU:** u. a. `temp2`, `dew`, `rh2`, `wind`, `gust`, `winddir`, `slp`, `cloud`, `lowcloud`, `highcloud`, `rainTotal`, `snowdepth`, `snowline`, `visibility`, `tmin`, `tmax`, `tsnow`, außerdem zahlreiche Druckflächenwerte (`t*/rh*/u*/v*/z*`).
- **ECMWF IFS:** zusätzlich je nach Produkt `solarTotal` (Globalstrahlung als Intervallfluss ableitbar), `convTotal`, `snowWater` (Schneewasseräquivalent, mm), `snowDensity` (Schneedichte, kg/m³), `snowWaterTotal`, `wind100`.
- **NOAA GFS:** zusätzliche Felder wie `cape`, `cin`, `reflectivity` (simulierte Radarreflektivität), `snowWater`. Nie als Radar-Beobachtung ausgeben.
- **Stündliche Ortsraster:** ICON-D2/ICON-EU bis zu ihrer jeweiligen verfügbaren Reichweite. Druckflächen- und Spezialprodukte können wesentlich gröbere Zeitschritte haben.

## Bewusst nicht erfunden
- `UV-Index`, `Sonnenstunden`, `Niederschlagswahrscheinlichkeit` (PoP) sind in den geprüften Original-Manifests nicht als eigenständige Datenfelder zugesichert. Auch aus einem einzelnen deterministischen Modell darf **keine** probabilistische Niederschlagswahrscheinlichkeit vorgetäuscht werden.
- Tornado- und Hagelindizes (SCP/STP/SHIP) sowie potenzielle Hagelkorngrößen bleiben ohne validierte Eingangsdaten und Berechnungen aus. Analog bedeutet eine einzelne geringe Sichtweite oder Schneewasserangabe nicht automatisch eine Straßenwarnung.
- Nicht verfügbare Werte werden mit **—** dargestellt, nicht mit 0 oder Ersatzwerten von fremden Wetterstationen.

## Mobile Datenverbrauch / Speicher
- Ortsprognosen über kleine `point-index.json`-Manifeste und benötigte komprimierte Kacheln.
- Modellkarten über `generated-native-*`-Manifeste, dann nur angeforderte Parameter/Zeitpunkte. Keine automatische Rückfall-Anfrage der großen `data/*.json` oder `data/*.json.gz` mehr auf Startseite und Karten.
- Die umfangreichen Legacy-Fetcher bleiben als Code vorhanden, werden in der normalen Mobile-Navigation aber nicht automatisch aufgerufen. Das schützt Funktionen vor voreiligem Entfernen.
- Geräte-Caches bleiben zeitlich beziehungsweise nach Eintragszahl begrenzt. Der lokale Ortsprognose-Cache enthält nur komprimierte Punktausschnitte. GitHub-Historie des Datenrepositories wird **nicht** automatisch kleiner durch diese Maßnahmen.

## Qualitätssicherung
GitHub Actions führt `node scripts/check-mobile.cjs` und einen Chromium-Browsertest für 360/390/768 px durch, mit Navigations-, Wetter-/Expert-/Gefahrenseiten- und Overflow-Prüfungen. Oberflächen-Screenshots werden als kurzlebige CI-Artefakte gespeichert; sie liegen **nicht** im Git-Projekt. Größenlimit für die fünf Anwendungsdateien: 4 MiB.

## Noch vor einer kommerziellen Veröffentlichung nötig
- Finale Lizenz- und Quellenprüfung der konkreten Datennutzung; vollständiges Impressum, belastbare Datenschutzerklärung, Nutzungsbedingungen.
- Amtliche Hochwasserwarnungen sowie weitere Landespegel und Straßen-/Glättewarnungen nur über tatsächlich lizenzierte, valide Schnittstellen ergänzen.
- Geräteübergreifende Tests, Performance-Messungen unter langsamem Mobilnetz, Fehler- und Offlineverhalten, gegebenenfalls eigener API-/Caching-Dienst statt dauerhafter Roh-GitHub-Auslieferung.
- Werbeeinbindung, Einwilligungs- und Datenschutzkonzept sowie Monetarisierung getrennt entwickeln; aktuell kein fertiges Geschäftsmodell implementiert.
