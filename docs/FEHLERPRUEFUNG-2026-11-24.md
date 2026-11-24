# Fehlerprüfung Wetter-App-Mobile – 24. November 2026

Geprüfte Ausgangsversion: `1c7660981e9f950ba1f80aae48a4cd7a0b1f9f3e`.

## Behobene Ursachen

| Bereich | Ursache | Korrektur / Nachweis |
| --- | --- | --- |
| Windkarte | Die Vorschau und aktuelle Flächenkarte fragten `gust` ab; die veröffentlichte RUC-Fläche enthält `wind`. | Mittlerer Wind nutzt `wind`; Böen bleiben als eigene Ebene erhalten. `test-weather-audit.cjs`. |
| Radarkarte | Fehlende beobachtete Niederschlagsarten wurden trotz Trennung auf der Startseite aus Modellwerten ergänzt. | Modellphase ausschließlich für zukünftige Radarprognosen; Punktabfrage, Worker und Hauptrenderer stimmen überein. `test-radar-phase.cjs`, `test-data-performance-unit.cjs`, `test-ui-responsiveness.cjs`. |
| Wettersymbol bei Radarausfall | Auch eine vorhandene aktuelle Bewölkungsanalyse verlor ihr Symbol, wenn Radar fehlte. | Bewölkung bleibt mit ausdrücklichem Hinweis auf den unbestätigten Niederschlagsstatus sichtbar. Veraltete oder zukünftige Werte werden ausgeschlossen. |
| Schneevorhersage | Stundenpakete enthielten Schnee-Wasseräquivalente, teilweise jedoch keinen WW-Code; das Symbol ignorierte die vorhandenen Schneemengen. | Differenzen desselben Modelllaufs und Intervalls werden ausgewertet. Explizite Modellphasen behalten Vorrang; Schneedecke allein ist kein Schneefallnachweis. Auch schwache Stundenmengen tragen zum Abschnittssymbol bei. |
| Laufende Stunde | Wetter und Temperatur waren mit dem Hauptfeld geteilt, weitere Detailwerte stammten weiterhin aus der Prognose. | Wind, Böen, Taupunkt, Bewölkung und Luftdruck verwenden dieselben aktuellen Quellen. Änderungen dieser Werte lösen ebenfalls eine Aktualisierung aus. |
| Bodenmeldungen | Symbolische Texte mit Unterstrichen und verneintem „freezing“ wurden falsch erkannt; vergangener Niederschlag konnte aktuell erscheinen. | Normalisierte Code-Texte; verneintes Gefrieren und vergangene Meldungen werden korrekt behandelt. Eiskörner bleiben eigenständig. `test-observed-surface.py`. |
| Pegel | `Number(null)` erzeugte einen scheinbaren Wasserstand von null; verspätete Antworten konnten die neuere Auswahl überschreiben. | Fehlend, echter Nullwert, veraltet und zukünftig werden unterschieden. Orts- und Pegelwechsel verwerfen überholte Antworten. Zeitreihen werden sortiert. `test-hazard-data.cjs`. |
| Straßenwetter / Fehlertexte | Zukünftige Paketzeiten wurden akzeptiert; Quellenlinks erschienen als maskierter HTML-Text. | Zeitprüfung und echte, getrennt erzeugte Quellenlinks. |
| Ortsübernahme bei Gefahren | Der voreingestellte Ort besaß nur einen Namen; die Gefahrenansicht erhielt dessen auf der Wetterseite bereits aufgelöste Koordinaten nicht. | Gemeinsame Ortsübergabe löst auch voreingestellte Orte auf; Suchkoordinaten bleiben vorrangig. Regression im echten Browser und im Kontextübergabetest. |
| Automatische Prüfungen | Radar-Tests erwarteten teilweise entfernte Farben bzw. eine überholte Schnittstelle; wichtige Prüfungen fehlten im CI-Lauf. | Erwartungen an gültige Transparenz und unbekannte Phase angepasst, fehlende Abhängigkeiten in Test-Fixtures ergänzt, neue Regressionen eingebunden. |

## Daten und Prüfumfang

Die Bestandsaufnahme umfasst Datenabruf und Paketvalidierung, Ortsprognosen, Stunden- und Tagesabschnitte, aktuelle Ortsanalyse, Radar samt Worker, Temperatur-/Windkarten, Warnkarten, Expertenparameter und Straßenwetter/Pegel. Veröffentlichte Manifeste und Datenpakete wurden zusätzlich direkt geprüft.

Im Datenrepository `Wetter-App` wurden unabhängig davon zwei tatsächliche fehlgeschlagene Veröffentlichungen nachgewiesen: ICON-EU am Größenlimit und ein IFS-Lauf durch konkurrierende Aktualisierungen von `main`. Die Korrekturen und Prüfungen dafür werden im Datenrepository geführt. Dort wurden auch falsche DWD-Quellnamen für konvektive Wolkenbasis/-obergrenze gefunden.

## Nachprüfbare Grenzen

- Fehlende Eingangsprodukte werden weiterhin als fehlend dargestellt. Die Prüfung erzeugt keine Messwerte für unbeobachtete Orte.
- Ein lokaler Tageshöchstwert kann bei fehlender belastbarer Tagesreihe weiterhin fehlen. Eine späte Einzelanalyse beweist keinen Tageshöchstwert.
- Radar, SYNOP, Satellit und RUC haben unterschiedliche Beobachtungs- bzw. Analysezeiten. Ein fünfminütiger Abruf erzeugt keine höhere zeitliche Auflösung der Quelle.
- Der vollständige Chromium-Testsatz wird über GitHub Actions geprüft. Der direkte lokale Chromium-Start wird durch die Ausführungsumgebung blockiert; die verfügbare Browseransicht wurde zusätzlich für echte Daten und Bedienung verwendet.
- Bestandene Prüfungen belegen die geprüften Fälle, keine allgemeine Fehlerfreiheit jeder zukünftigen Wetterlage.

Meteorologischer Abgleich: DWD [ICON-Ausgabefelder](https://www.dwd.de/SharedDocs/downloads/DE/modelldokumentationen/nwv/icon_d2/icon_d2_dbbeschr_aktuell.pdf?nn=344870&view=nasPublication) und aktuelle DWD-Parameterverzeichnisse.
