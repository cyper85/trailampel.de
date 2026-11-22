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

// Icon je Status, damit er auch ohne Farbwahrnehmung unterscheidbar ist
export const STATUS_ICONS = {
    "ACTIVE": "✔",
    "WARNING": "⚠",
    "CLOSED": "\u{1F6B3}",
    "INACTIVE": "\u{1F4A4}",
    "DESTROYED": "☠",
    "NOT READY": "\u{1F6A7}"
};

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
