// Gemeinsame Definitionen für die Trailampel-Seite (trails.js) und das Widget (widget.js)

// Klartext zum Status, damit er nicht nur über die Farbe erkennbar ist
export const STATUS_LABELS = {
    "ACTIVE": "Fahrbar",
    "WARNING": "Eingeschränkt fahrbar",
    "CLOSED": "Gesperrt",
    "INACTIVE": "Nicht aktiv",
    "DESTROYED": "Zerstört",
    "NOT READY": "Noch nicht fertig"
};

// Symbol je Status als SVG-Inhalt (viewBox 0 0 24 24), damit der Status auch ohne
// Farbwahrnehmung unterscheidbar ist. Die Symbole übernehmen die Schriftfarbe (currentColor),
// nur "Gesperrt" hat als Verkehrszeichen eigene Farben.
const STROKE = 'fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"';
export const STATUS_ICONS = {
    // Haken im Kreis
    "ACTIVE": `<g ${STROKE} stroke-width="2.5"><circle cx="12" cy="12" r="9.5"/><path d="M7.5 12.5l3 3 6-6.5"/></g>`,
    // Ausrufezeichen im Kreis
    "WARNING": `<g ${STROKE} stroke-width="2.5"><circle cx="12" cy="12" r="9.5"/><path d="M12 7v6M12 16.5v.1"/></g>`,
    // Verkehrszeichen 267 "Verbot der Einfahrt" mit weißem Rand für roten Hintergrund
    "CLOSED": '<circle cx="12" cy="12" r="11.5" fill="#fff"/><circle cx="12" cy="12" r="10" style="fill:var(--trailampel-closed,#dc3545)"/><rect x="5.5" y="10" width="13" height="4" rx=".5" fill="#fff"/>',
    // Pause im Kreis
    "INACTIVE": `<g ${STROKE} stroke-width="2.5"><circle cx="12" cy="12" r="9.5"/><path d="M10 8.5v7M14 8.5v7"/></g>`,
    // Totenkopf mit gekreuzten Knochen, Augen, Nase und Zähne ausgespart
    "DESTROYED": '<path d="M5 15l14 6.5M19 15L5 21.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><g fill="currentColor"><circle cx="4.3" cy="13.8" r="1.3"/><circle cx="3.6" cy="15.9" r="1.3"/><circle cx="19.7" cy="13.8" r="1.3"/><circle cx="20.4" cy="15.9" r="1.3"/><circle cx="3.6" cy="20.6" r="1.3"/><circle cx="4.3" cy="22.7" r="1.3"/><circle cx="20.4" cy="20.6" r="1.3"/><circle cx="19.7" cy="22.7" r="1.3"/><path fill-rule="evenodd" d="M12 1.5a6.5 6.5 0 0 0-6.5 6.5c0 2.1.9 3.6 2.4 4.6V15.5h8.2v-2.9c1.5-1 2.4-2.5 2.4-4.6A6.5 6.5 0 0 0 12 1.5zM8 8.6a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0zM12.6 8.6a1.7 1.7 0 1 0 3.4 0a1.7 1.7 0 1 0-3.4 0zM12 10.8l-1.1 1.9h2.2zM10.6 13.8h.8v1.7h-.8zM12.6 13.8h.8v1.7h-.8z"/></g>',
    // Absperrschranke
    "NOT READY": `<g ${STROKE} stroke-width="2"><rect x="2.5" y="7" width="19" height="7" rx="1"/><path d="M8 7l-4.5 7M13.5 7L9 14M19 7l-4.5 7M6 14v6M18 14v6"/></g>`
};

// Erzeugt das Symbol zu einem Status als <svg>; rein dekorativ, der Status steht immer zusätzlich als Text daneben
export function create_status_icon(status) {
    const template = document.createElement('template');
    template.innerHTML = '<svg class="status-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (STATUS_ICONS[status] ?? '') + '</svg>';
    return template.content.firstElementChild;
}

export const RIDEABLE_STATES = ["ACTIVE", "WARNING"];

const MONTHS = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

// "2026-10-31" bzw. "2026-10" -> "Oktober 2026"
export function format_checkup(checkup_string) {
    const found = checkup_string.match(/^([0-9]{4})-([0-9]{2})(-[0-9]{2})?$/);
    if (!found) {
        return checkup_string;
    }
    return MONTHS[parseInt(found[2], 10)] + ' ' + found[1];
}
