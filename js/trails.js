function readTextFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status === 200) {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}

function get_month(checkup_string) {
    const regex = /^[0-9]{4}-([0-9]{2})(-[0-9]{2})?$/;
    const found = checkup_string.match(regex)
    const months = ['', 'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
    return months[parseInt(found[1])]
}
function get_year(checkup_string) {
    const regex = /^([0-9]{4})(-[0-9]{2}){1,2}$/;
    const found = checkup_string.match(regex)
    return found[1]
}
function last_checkup(checkup_string) {
    const span = document.createElement("span");
    span.classList.add('last_checkup');
    span.innerHTML = '(Letzter Check: ' + get_month(checkup_string) + ' ' + get_year(checkup_string) + ')';
    return span.outerHTML;
}

// E-Mail-Adresse erst im Browser zusammensetzen, damit sie nicht im Quelltext steht
function reveal_email(element) {
    const reverse = s => s.split('').reverse().join('');
    const address = reverse(element.dataset.user) + '@' + reverse(element.dataset.domain);
    const link = document.createElement('a');
    link.href = 'mailto:' + address;
    link.textContent = address;
    element.replaceChildren(link);
}
document.querySelectorAll('.email').forEach(reveal_email);

const RIDEABLE_STATES = ["ACTIVE", "WARNING"];

// Liefert nur die fahrbaren Trails; Städte und Zonen ohne fahrbare Trails entfallen
function filter_rideable(data) {
    const result = {};
    for (const city in data) {
        for (const zone in data[city]) {
            for (const trail in data[city][zone]) {
                if (RIDEABLE_STATES.includes(data[city][zone][trail]['status'])) {
                    result[city] ??= {};
                    result[city][zone] ??= {};
                    result[city][zone][trail] = data[city][zone][trail];
                }
            }
        }
    }
    return result;
}

//usage:
readTextFile("trails.json", function(text){
    const all_trails = JSON.parse(text);
    const filter = document.body.querySelector('#filter-rideable');

    filter.checked = localStorage.getItem('filter-rideable') === '1';
    filter.addEventListener('change', function() {
        localStorage.setItem('filter-rideable', filter.checked ? '1' : '0');
        const count = render_table(filter.checked ? filter_rideable(all_trails) : all_trails);
        // Screenreadern mitteilen, was der Filter bewirkt hat
        document.body.querySelector('#trail-count').textContent = count + ' Trails angezeigt';
    });
    render_table(filter.checked ? filter_rideable(all_trails) : all_trails);
});

// Klartext zum Status, damit er nicht nur über die Farbe erkennbar ist
const STATUS_LABELS = {
    "ACTIVE": "Fahrbar",
    "WARNING": "Eingeschränkt fahrbar",
    "CLOSED": "Gesperrt",
    "INACTIVE": "Nicht aktiv",
    "DESTROYED": "Zerstört",
    "NOT READY": "Noch nicht fertig"
};

// Erzeugt eine Zelle mit expliziter ARIA-Rolle: Auf dem Handy wird die Tabelle per CSS
// zu Blöcken umgebaut, wodurch manche Browser die Tabellensemantik verwerfen
function create_cell(tag, role, ...classes) {
    const cell = document.createElement(tag);
    cell.setAttribute("role", role);
    cell.classList.add(...classes);
    return cell;
}

function create_row() {
    const tr = document.createElement("tr");
    tr.setAttribute("role", "row");
    return tr;
}

function render_table(data) {
    const trailtable = document.body.querySelector('#trailtable');
    var trail_count = 0;

    // Empty Table
    trailtable.innerHTML = "";
    trailtable.classList.remove("is-loading");
    trailtable.removeAttribute("aria-busy");

    // Table Head
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    thead.setAttribute("role", "rowgroup");
    tbody.setAttribute("role", "rowgroup");
    const tr_head = create_row();
    for (const label of ["City", "Zone", "Trail", "Status"]) {
        const th = create_cell("th", "columnheader");
        th.setAttribute("scope", "col");
        th.textContent = label;
        tr_head.appendChild(th);
    }
    const th_empty = create_cell("th", "columnheader", "editor-button");
    th_empty.setAttribute("scope", "col");
    th_empty.innerHTML = '<span class="visually-hidden">Bearbeiten</span>';
    tr_head.appendChild(th_empty);

    thead.appendChild(tr_head);
    trailtable.appendChild(thead);
    trailtable.appendChild(tbody);
    var current_tr = create_row();
    for (const city in data) {
        // Stadt und Zone sind Zeilenüberschriften für alle Trails, die sie überspannen
        const city_th = create_cell("th", "rowheader", "city");
        city_th.setAttribute("scope", "row");
        city_th.textContent = city;
        var rowspan = 0;
        for(const zone in data[city]) { rowspan += Object.keys(data[city][zone]).length; }
        city_th.setAttribute("rowspan", rowspan);
        city_th.setAttribute("aria-rowspan", rowspan);
        current_tr.appendChild(city_th);

        for(const zone in data[city]) {
            const zone_th = create_cell("th", "rowheader", "zone");
            zone_th.setAttribute("scope", "row");
            zone_th.textContent = zone;
            zone_th.setAttribute("rowspan", Object.keys(data[city][zone]).length);
            zone_th.setAttribute("aria-rowspan", Object.keys(data[city][zone]).length);
            current_tr.appendChild(zone_th);

            for(const trail in data[city][zone]) {
                trail_count++;
                const trail_td = create_cell("td", "cell", "trail");
                if ('alt_name' in data[city][zone][trail]) {
                    trail_td.textContent = trail + ' (' + data[city][zone][trail]['alt_name'] + ')';
                } else {
                    trail_td.textContent = trail;
                }
                current_tr.appendChild(trail_td);
                const state_td = create_cell("td", "cell", "state");
                current_tr.appendChild(state_td);

                const status = data[city][zone][trail]['status'];
                const status_label = document.createElement("span");
                status_label.classList.add("visually-hidden");
                status_label.textContent = (STATUS_LABELS[status] ?? status) + '. ';
                state_td.appendChild(status_label);

                if (status === "ACTIVE") {
                    trail_td.classList.add("bg-success");
                    state_td.classList.add("bg-success");
                } else if (data[city][zone][trail]['status'] === "WARNING") {
                    trail_td.classList.add("bg-warning");
                    state_td.classList.add("bg-warning");
                    trail_td.classList.add("text-black");
                    state_td.classList.add("text-black");
                } else if (data[city][zone][trail]['status'] === "CLOSED") {
                    trail_td.classList.add("bg-danger");
                    state_td.classList.add("bg-danger");
                    state_td.insertAdjacentHTML("beforeend", '<span aria-hidden="true">&#128691;&nbsp;</span>');
                } else if (data[city][zone][trail]['status'] === "DESTROYED") {
                    trail_td.classList.add("bg-danger");
                    state_td.classList.add("bg-danger");
                    state_td.insertAdjacentHTML("beforeend", '<span aria-hidden="true">&#9760;&nbsp;</span>');
                } else {
                    trail_td.classList.add("bg-danger");
                    state_td.classList.add("bg-danger");
                }

                if (data[city][zone][trail]['message']) {
                    state_td.append(data[city][zone][trail]['message']);
                }

                if (data[city][zone][trail]['last_checkup']) {
                    state_td.insertAdjacentHTML("beforeend", last_checkup(data[city][zone][trail]['last_checkup']));
                }

                // Nur der unsichtbare Statustext: auf dem Handy keine leere Fläche anzeigen
                if (state_td.childNodes.length === 1) {
                    state_td.classList.add("no-visible-content");
                }

                // Editor Button
                const editor_td = create_cell("td", "cell", "editor-button");
                const editor_button = document.createElement("a");
                editor_button.classList.add("btn");
                editor_button.classList.add("btn-primary");
                editor_button.classList.add("btn-sm");
                editor_button.innerHTML = '<span aria-hidden="true">&#9998;</span>';
                editor_button.setAttribute("aria-label", trail + " bearbeiten");
                editor_button.setAttribute("data-bs-toggle", "modal");
                editor_button.setAttribute("data-bs-target", "#editorModal");
                editor_button.setAttribute("href", "https://editor.trailampel.de/editor.php?city=" + encodeURIComponent(city) + "&zone=" + encodeURIComponent(zone) + "&trail=" + encodeURIComponent(trail));
                editor_td.appendChild(editor_button);
                current_tr.appendChild(editor_td);

                tbody.appendChild(current_tr);
                current_tr = create_row();
            }
        }
    }
    return trail_count;
}