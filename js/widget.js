// Trailampel-Widget zum Einbinden auf anderen Seiten, Doku siehe README.md
//
// Das Skript lädt trails.json genau einmal und füllt danach in einem Durchlauf
// alle Container mit der Klasse "trailampel-widget". Als Modul eingebunden
// führt der Browser es auch bei mehrfacher Einbindung nur einmal aus.

import { STATUS_LABELS, format_checkup, create_status_icon } from './status.js';

const SOURCE_URL = new URL('../trails.json', import.meta.url);
const HOME_URL = new URL('../', import.meta.url);
const SELECTOR = '.trailampel-widget';

const CSS = `
.trailampel-widget{--trailampel-ok:#198754;--trailampel-warn:#ffc107;--trailampel-closed:#dc3545}
.trailampel-list{list-style:none;margin:0;padding:0}
.trailampel-trail{display:flex;gap:.6em;align-items:flex-start;padding:.4em 0;border-bottom:1px solid rgba(128,128,128,.25)}
.trailampel-icon{flex:none;display:inline-flex;align-items:center;justify-content:center;width:1.6em;height:1.6em;border-radius:.3em;font-size:.85em;line-height:1;color:#fff;background:var(--trailampel-closed)}
.trailampel-icon svg{width:1.3em;height:1.3em}
.trailampel-ok .trailampel-icon{background:var(--trailampel-ok)}
.trailampel-warn .trailampel-icon{color:#000;background:var(--trailampel-warn)}
.trailampel-name{font-weight:bold}
.trailampel-message{display:block}
.trailampel-checkup,.trailampel-source{font-size:.8em;opacity:.75}
.trailampel-group{font-weight:bold;margin:.8em 0 .2em}
.trailampel-group:first-child{margin-top:0}
.trailampel-single{display:flex;gap:.6em;align-items:flex-start;margin:0}
.trailampel-single .trailampel-message{display:inline}
.trailampel-source{text-align:right;margin:.4em 0 0}
`;

function status_class(status) {
    if (status === 'ACTIVE') return 'trailampel-ok';
    if (status === 'WARNING') return 'trailampel-warn';
    return 'trailampel-closed';
}

// Alle Trails, die zu den gesetzten Filtern passen; nicht gesetzte Filter gelten als "alle"
export function select_trails(data, filter) {
    const result = [];
    for (const city in data) {
        if (filter.city && filter.city !== city) continue;
        for (const zone in data[city]) {
            if (filter.zone && filter.zone !== zone) continue;
            for (const trail in data[city][zone]) {
                if (filter.trail && filter.trail !== trail) continue;
                result.push({ city, zone, trail, info: data[city][zone][trail] });
            }
        }
    }
    return result;
}

function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
}

function icon(status) {
    // Nur zur Optik, der Status steht zusätzlich als Text daneben
    const span = element('span', 'trailampel-icon');
    span.setAttribute('aria-hidden', 'true');
    span.append(create_status_icon(status));
    return span;
}

// Status, Nachricht und letzter Check als Inhalt eines Elements
function append_details(parent, info) {
    parent.append(element('span', 'trailampel-state', STATUS_LABELS[info.status] ?? info.status));
    if (info.message) {
        parent.append(' ', element('span', 'trailampel-message', info.message));
    }
    if (info.last_checkup) {
        parent.append(' ', element('span', 'trailampel-checkup', '(Letzter Check: ' + format_checkup(info.last_checkup) + ')'));
    }
}

function render_single(entry) {
    const p = element('p', 'trailampel-single ' + status_class(entry.info.status));
    const text = element('span', 'trailampel-text');
    append_details(text, entry.info);
    p.append(icon(entry.info.status), text);
    return p;
}

function render_trail(entry) {
    const li = element('li', 'trailampel-trail ' + status_class(entry.info.status));
    const text = element('div', 'trailampel-text');
    const name = entry.info.alt_name ? entry.trail + ' (' + entry.info.alt_name + ')' : entry.trail;
    text.append(element('span', 'trailampel-name', name), ' – ');
    append_details(text, entry.info);
    li.append(icon(entry.info.status), text);
    return li;
}

// Liste der Trails; Stadt und Zone erscheinen nur als Zwischenzeile, wenn der Filter sie offen lässt
function render_list(entries, filter, fragment) {
    const show_city = !filter.city;
    const show_zone = !filter.zone;
    let current_group = null;
    let list = null;

    for (const entry of entries) {
        const parts = [];
        if (show_city) parts.push(entry.city);
        if (show_zone) parts.push(entry.zone);
        const group = parts.join(' – ');

        if (list === null || group !== current_group) {
            if (group) fragment.append(element('p', 'trailampel-group', group));
            list = element('ul', 'trailampel-list');
            fragment.append(list);
            current_group = group;
        }
        list.append(render_trail(entry));
    }
}

function render_widget(container, data) {
    const filter = {
        city: container.dataset.city,
        zone: container.dataset.zone,
        trail: container.dataset.trail
    };
    const entries = select_trails(data, filter);
    // Nichts gefunden: Der Ausweichinhalt des Containers bleibt stehen
    if (entries.length === 0) return;

    const single = Boolean(filter.trail) && entries.length === 1;
    const fragment = document.createDocumentFragment();
    if (single) {
        fragment.append(render_single(entries[0]));
    } else {
        render_list(entries, filter, fragment);
    }

    // Link zur Trailampel: bei Einzel-Trails standardmäßig aus, sonst an; per data-link überschreibbar
    const show_link = container.dataset.link ? container.dataset.link !== 'false' : !single;
    if (show_link) {
        const source = element('p', 'trailampel-source');
        const link = element('a', null, 'Status von trailampel.de');
        link.href = HOME_URL.href;
        source.append(link);
        fragment.append(source);
    }

    container.replaceChildren(fragment);
}

function add_style() {
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.prepend(style);
}

function dom_ready() {
    return document.readyState === 'loading'
        ? new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve, { once: true }))
        : Promise.resolve();
}

async function init() {
    await dom_ready();
    // Ohne Container auf der Seite keine Anfrage
    const containers = document.querySelectorAll(SELECTOR);
    if (containers.length === 0) return;

    let data;
    try {
        const response = await fetch(SOURCE_URL);
        if (!response.ok) throw new Error('HTTP ' + response.status);
        data = await response.json();
    } catch (error) {
        // Ausweichinhalt der Container bleibt stehen
        console.warn('Trailampel-Widget: trails.json konnte nicht geladen werden', error);
        return;
    }

    add_style();
    containers.forEach(container => render_widget(container, data));
}

if (typeof document !== 'undefined') {
    init();
}
