# trailampel.de
Kleines Projekt um Status von MTB Trails, analog einer Ski-Pisten-Anzeige darzustellen

## Widget

Mit dem Widget lässt sich der Trailstatus auf anderen Seiten einbinden, z. B. auf der Seite eines Trailparks.
Die Daten kommen direkt aus der `trails.json` dieses Projekts, sie werden also nur hier gepflegt.

Angezeigt werden je Trail nur Status-Symbol, Name, Status, Nachricht und letzter Check, dazu klein ein Link zur Trailampel.
Überschriften, Filter oder Bearbeiten-Buttons gibt es im Widget nicht.

### Einbinden

An jeder Stelle, an der Trails erscheinen sollen, einen Container einfügen und das Skript **einmal** am Ende der Seite einbinden:

```html
<div class="trailampel-widget" data-city="Ilmenau" data-zone="Trailpark Lindenberg">
    <a href="https://trailampel.de/">Trailstatus auf trailampel.de</a>
</div>

<script type="module" src="https://trailampel.de/js/widget.js"></script>
```

Der Inhalt des Containers ist der Ausweichinhalt. Er bleibt stehen, wenn JavaScript fehlt, die Daten nicht geladen werden können oder der Filter keinen Trail findet.

Das Skript lädt `trails.json` pro Seitenaufruf genau einmal und füllt danach alle Container in einem Durchlauf.
Beliebig viele Container auf einer Seite kosten also nur eine Anfrage.
Wird das Skript versehentlich mehrfach eingebunden, führt der Browser es trotzdem nur einmal aus.

### Filter

Alle Angaben sind optional, jede gesetzte Angabe schränkt weiter ein.
Die Werte müssen genau den Namen in der `trails.json` entsprechen (Groß-/Kleinschreibung, Leerzeichen).

| Attribut     | Bedeutung                                                       |
|--------------|-----------------------------------------------------------------|
| `data-city`  | Stadt, z. B. `Ilmenau`                                          |
| `data-zone`  | Zone bzw. Berg, z. B. `Trailpark Lindenberg`                    |
| `data-trail` | einzelner Trail, z. B. `Flow Trail`                             |
| `data-link`  | `true` oder `false`: Link „Status von trailampel.de“ anzeigen   |

Beispiele:

```html
<!-- Alle Trails einer Zone -->
<div class="trailampel-widget" data-city="Ilmenau" data-zone="Trailpark Lindenberg"></div>

<!-- Ein einzelner Trail, z. B. in der Beschreibung des Trails -->
<div class="trailampel-widget" data-city="Ilmenau" data-zone="Trailpark Lindenberg" data-trail="Flow Trail"></div>

<!-- Alle Trails einer Stadt, gruppiert nach Zone -->
<div class="trailampel-widget" data-city="Ilmenau"></div>
```

### Darstellung

- **Liste:** Bei mehreren Trails erscheint eine Liste mit Symbol, Name, Status, Nachricht und letztem Check.
  Stadt und Zone werden nur als Zwischenzeile gezeigt, wenn der Filter sie offen lässt.
  Bei `data-city` allein steht also über jeder Zone eine Zwischenzeile, bei `data-city` und `data-zone` keine.
- **Einzelner Trail:** Ist `data-trail` gesetzt und passt genau ein Trail, erscheint eine kompakte Zeile ohne Trailnamen,
  weil der in der Regel schon in der umgebenden Überschrift steht.
  Der Link zur Trailampel ist dann standardmäßig ausgeblendet, damit er bei mehreren Einzel-Widgets nicht ständig wiederholt wird.
  Mit `data-link="true"` lässt er sich einblenden, umgekehrt blendet `data-link="false"` ihn bei Listen aus.

### Gestaltung anpassen

Das Widget bringt nur wenig eigenes CSS mit und übernimmt Schrift, Schriftgröße und Textfarbe von der einbindenden Seite.
Die Statusfarben lassen sich über CSS-Variablen anpassen:

```css
.trailampel-widget {
    --trailampel-ok: #198754;      /* Fahrbar */
    --trailampel-warn: #ffc107;    /* Eingeschränkt fahrbar */
    --trailampel-closed: #dc3545;  /* Gesperrt, nicht aktiv, zerstört, noch nicht fertig */
}
```

Weitere Anpassungen sind über die Klassen möglich, alle beginnen mit `trailampel-`
(z. B. `.trailampel-trail`, `.trailampel-name`, `.trailampel-message`, `.trailampel-checkup`, `.trailampel-source`).

### Hinweise

- Statusänderungen erscheinen im Widget mit bis zu etwa 10 Minuten Verzögerung, weil GitHub Pages Dateien so lange zwischenspeichert.
- Das Widget lädt Skript und Daten von trailampel.de (GitHub Pages). Das sollte in der Datenschutzerklärung der einbindenden Seite erwähnt werden.
- Beispiele zum Ausprobieren: [widget.html](widget.html). Lokal muss die Seite über einen Webserver aufgerufen werden
  (z. B. `npx http-server`), weil Browser Module nicht direkt aus dem Dateisystem laden.
