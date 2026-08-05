/* Grace Studio — About Page Editor
 *
 * Sections managed:
 *   bio        — paragraphs of about text
 *   skills     — Languages / Frameworks & Libraries / Tools & Platforms chips
 *   currently  — 4-column "now" grid (Reading, Listening to, Watching, Working On)
 *   experience — timeline items
 *   hobbies    — Outside of Code cards
 */
// ── Helpers (scoped to avoid conflicts) ──────────────────────────
function aEsc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c =>
        ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
// ── Entry point ──────────────────────────────────────────────────
async function renderAboutEditor() {
    const content = document.getElementById("studio-content");
    content.innerHTML = `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;">
            <h1 style="margin:0;">About Page</h1>
            <button class="primary" id="saveAbout">Save All Changes</button>
        </div>
        <div id="aboutStatus" style="display:none;margin-bottom:16px;padding:10px 14px;border-radius:4px;font-size:.85rem;"></div>

        ${sectionCard("bio",        "Bio")}
        ${sectionCard("skills",     "Skills")}
        ${sectionCard("currently",  "Currently")}
        ${sectionCard("experience", "Experience")}
        ${sectionCard("hobbies",    "Outside of Code")}
    `;
    // Load data then populate each section
    try {
        const data = await apiFetch("/api/about");
        populateBio(data.bio || []);
        populateSkills(data.skills || {});
        populateCurrently(data.currently || {});
        populateExperience(data.experience || []);
        populateHobbies(data.hobbies || []);
    } catch (err) {
        showAboutStatus("Couldn't load about data: " + err.message, "error");
    }
    document.getElementById("saveAbout").onclick = saveAbout;
}

function sectionCard(id, title) {
    return `
        <div class="studio-card" style="margin-bottom:20px;">
            <div style="font-size:.7rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:16px;">${aEsc(title)}</div>
            <div id="section-${id}"></div>
        </div>`;
}

// ── Status banner ────────────────────────────────────────────────
function showAboutStatus(msg, type = "ok") {
    const el = document.getElementById("aboutStatus");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
    el.style.background = type === "ok" ? "var(--green-bg, #f0fdf4)" : "var(--red-bg, #fef2f2)";
    el.style.color      = type === "ok" ? "var(--green, #16a34a)"    : "var(--danger, #dc2626)";
    el.style.border     = `1px solid ${type === "ok" ? "#bbf7d0" : "#fecaca"}`;
    if (type === "ok") setTimeout(() => { el.style.display = "none"; }, 3000);
}

// ════════════════════════════════════════════════════════════════
// BIO
// ════════════════════════════════════════════════════════════════
function populateBio(paragraphs) {
    const el = document.getElementById("section-bio");
    el.innerHTML = `
        <div id="bioParagraphs">
            ${paragraphs.map((p, i) => bioParagraphRow(p, i)).join("")}
        </div>
        <button id="addBioPara" style="margin-top:10px;">+ Add Paragraph</button>`;
    wireAddBio();
}

function bioParagraphRow(text, i) {
    return `
        <div class="about-row" data-index="${i}" style="display:flex;gap:8px;margin-bottom:8px;">
            <textarea class="bio-para" rows="3" style="flex:1;resize:vertical;">${aEsc(text)}</textarea>
            <button class="danger remove-bio-para" style="align-self:flex-start;">✕</button>
        </div>`;
}

function wireAddBio() {
    document.getElementById("addBioPara").onclick = () => {
        const container = document.getElementById("bioParagraphs");
        const idx = container.children.length;
        container.insertAdjacentHTML("beforeend", bioParagraphRow("", idx));
        wireRemoveBio();
    };
    wireRemoveBio();
}

function wireRemoveBio() {
    document.querySelectorAll(".remove-bio-para").forEach(btn => {
        btn.onclick = () => btn.closest(".about-row").remove();
    });
}

function collectBio() {
    return [...document.querySelectorAll(".bio-para")]
        .map(t => t.value.trim()).filter(Boolean);
}

// ════════════════════════════════════════════════════════════════
// SKILLS
// ════════════════════════════════════════════════════════════════
const SKILL_GROUPS = [
    { key: "languages",   label: "Languages" },
    { key: "frameworks",  label: "Frameworks & Libraries" },
    { key: "tools",       label: "Tools & Platforms" },
];

function populateSkills(skills) {
    const el = document.getElementById("section-skills");
    el.innerHTML = SKILL_GROUPS.map(g => `
        <div style="margin-bottom:18px;">
            <div style="font-size:.75rem;font-weight:600;color:var(--ink);margin-bottom:6px;">${aEsc(g.label)}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;" id="chips-${g.key}">
                ${(skills[g.key] || []).map(chip => chipTag(g.key, chip)).join("")}
            </div>
            <div style="display:flex;gap:6px;">
                <input id="chipInput-${g.key}" placeholder="Add skill…" style="width:180px;">
                <button class="add-chip-btn" data-group="${g.key}">Add</button>
            </div>
        </div>`).join("");
    document.querySelectorAll(".add-chip-btn").forEach(btn => {
        btn.onclick = () => addChip(btn.dataset.group);
    });
    document.querySelectorAll(".chip-input-field").forEach(inp => {
        inp.addEventListener("keydown", e => { if (e.key === "Enter") addChip(inp.dataset.group); });
    });
    wireRemoveChips();
}

function chipTag(group, text) {
    return `<span class="chip studio-chip" data-group="${aEsc(group)}" style="display:inline-flex;align-items:center;gap:4px;">
        ${aEsc(text)}<button class="remove-chip" data-group="${aEsc(group)}" style="background:none;border:none;cursor:pointer;padding:0;line-height:1;color:var(--muted);">✕</button>
    </span>`;
}

function addChip(group) {
    const input = document.getElementById(`chipInput-${group}`);
    const val = input.value.trim();
    if (!val) return;
    document.getElementById(`chips-${group}`)
        .insertAdjacentHTML("beforeend", chipTag(group, val));
    input.value = "";
    wireRemoveChips();
}

function wireRemoveChips() {
    document.querySelectorAll(".remove-chip").forEach(btn => {
        btn.onclick = () => btn.closest(".studio-chip").remove();
    });
}

function collectSkills() {
    const result = {};
    SKILL_GROUPS.forEach(g => {
        result[g.key] = [...document.querySelectorAll(`#chips-${g.key} .studio-chip`)]
            .map(el => el.childNodes[0].textContent.trim()).filter(Boolean);
    });
    return result;
}

// ════════════════════════════════════════════════════════════════
// CURRENTLY — 4 columns
// ════════════════════════════════════════════════════════════════
const NOW_COLS = [
    { key: "reading",    label: "Reading",      icon: "book-open"  },
    { key: "listening",  label: "Listening to", icon: "music"      },
    { key: "watching",   label: "Watching",     icon: "tv"         },
    { key: "working",    label: "Working On",   icon: "terminal"   },
];

function populateCurrently(currently) {
    const el = document.getElementById("section-currently");
    el.innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
            ${NOW_COLS.map(col => `
                <div>
                    <div style="font-size:.72rem;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;">${aEsc(col.label)}</div>
                    <div id="now-entries-${col.key}">
                        ${(currently[col.key] || []).map((e, i) => nowEntryRow(col.key, e, i)).join("")}
                    </div>
                    <button class="add-now-entry" data-col="${col.key}" style="font-size:.75rem;margin-top:4px;">+ Add</button>
                </div>`).join("")}
        </div>`;

    document.querySelectorAll(".add-now-entry").forEach(btn => {
        btn.onclick = () => {
            const col = btn.dataset.col;
            const container = document.getElementById(`now-entries-${col}`);
            const idx = container.children.length;
            container.insertAdjacentHTML("beforeend", nowEntryRow(col, { title: "", sub: "" }, idx));
            wireRemoveNowEntries();
        };
    });
    wireRemoveNowEntries();
}

function nowEntryRow(col, entry, i) {
    const title = typeof entry === "string" ? entry : (entry.title || "");
    const sub   = typeof entry === "string" ? ""    : (entry.sub   || "");
    return `
        <div class="now-entry-row" data-col="${aEsc(col)}" style="margin-bottom:8px;padding:8px;border:1px solid var(--border);border-radius:4px;background:var(--surface);">
            <div style="display:flex;gap:6px;align-items:flex-start;">
                <div style="flex:1;">
                    <input class="now-title" placeholder="Title / item…" value="${aEsc(title)}" style="width:100%;margin-bottom:4px;">
                    <input class="now-sub"   placeholder="Subtitle (author, creator…)" value="${aEsc(sub)}" style="width:100%;font-size:.8rem;">
                </div>
                <button class="danger remove-now-entry" style="flex-shrink:0;align-self:flex-start;">✕</button>
            </div>
        </div>`;
}

function wireRemoveNowEntries() {
    document.querySelectorAll(".remove-now-entry").forEach(btn => {
        btn.onclick = () => btn.closest(".now-entry-row").remove();
    });
}

function collectCurrently() {
    const result = {};
    NOW_COLS.forEach(col => {
        result[col.key] = [...document.querySelectorAll(`#now-entries-${col.key} .now-entry-row`)]
            .map(row => ({
                title: row.querySelector(".now-title").value.trim(),
                sub:   row.querySelector(".now-sub").value.trim(),
            })).filter(e => e.title);
    });
    return result;
}

// ════════════════════════════════════════════════════════════════
// EXPERIENCE
// ════════════════════════════════════════════════════════════════
const BADGE_TYPES = ["Internship", "Research", "Policy", "Hackathon", "Education", "Other"];

function populateExperience(items) {
    const el = document.getElementById("section-experience");
    el.innerHTML = `
        <div id="expItems">
            ${items.map((item, i) => expRow(item, i)).join("")}
        </div>
        <button id="addExp" style="margin-top:10px;">+ Add Experience</button>`;
    wireAddExp();
}

function expRow(item, i) {
    return `
        <div class="exp-row" style="border:1px solid var(--border);border-radius:4px;padding:14px;margin-bottom:12px;background:var(--surface);">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
                <div>
                    <label style="font-size:.73rem;color:var(--muted);">Date</label>
                    <input class="exp-date" value="${aEsc(item.date || "")}" placeholder="May – Jul 2026" style="width:100%;">
                </div>
                <div>
                    <label style="font-size:.73rem;color:var(--muted);">Badge Type</label>
                    <select class="exp-badge" style="width:100%;">
                        ${BADGE_TYPES.map(b => `<option value="${b}" ${item.badge===b?"selected":""}>${b}</option>`).join("")}
                    </select>
                </div>
            </div>
            <label style="font-size:.73rem;color:var(--muted);">Title</label>
            <input class="exp-title" value="${aEsc(item.title || "")}" placeholder="Role — Company" style="width:100%;margin-bottom:8px;">
            <label style="font-size:.73rem;color:var(--muted);">Description</label>
            <textarea class="exp-desc" rows="3" style="width:100%;resize:vertical;">${aEsc(item.desc || "")}</textarea>
            <div style="text-align:right;margin-top:6px;">
                <button class="danger remove-exp">Delete</button>
            </div>
        </div>`;
}

function wireAddExp() {
    document.getElementById("addExp").onclick = () => {
        const container = document.getElementById("expItems");
        const idx = container.children.length;
        container.insertAdjacentHTML("beforeend", expRow({}, idx));
        wireRemoveExp();
    };
    wireRemoveExp();
}

function wireRemoveExp() {
    document.querySelectorAll(".remove-exp").forEach(btn => {
        btn.onclick = () => btn.closest(".exp-row").remove();
    });
}

function collectExperience() {
    return [...document.querySelectorAll(".exp-row")].map(row => ({
        date:  row.querySelector(".exp-date").value.trim(),
        badge: row.querySelector(".exp-badge").value,
        title: row.querySelector(".exp-title").value.trim(),
        desc:  row.querySelector(".exp-desc").value.trim(),
    })).filter(e => e.title);
}

// ════════════════════════════════════════════════════════════════
// HOBBIES
// ════════════════════════════════════════════════════════════════
function populateHobbies(items) {
    const el = document.getElementById("section-hobbies");
    el.innerHTML = `
        <div id="hobbyItems" style="display:grid;grid-template-columns:repeat(2,1fr);gap:12px;">
            ${items.map((item, i) => hobbyRow(item, i)).join("")}
        </div>
        <button id="addHobby" style="margin-top:10px;">+ Add Hobby</button>`;
    wireAddHobby();
}

function hobbyRow(item, i) {
    return `
        <div class="hobby-row" style="border:1px solid var(--border);border-radius:4px;padding:12px;background:var(--surface);">
            <div style="display:flex;gap:8px;margin-bottom:8px;">
                <input class="hobby-icon" value="${aEsc(item.icon || "")}" placeholder="Lucide icon (e.g. mountain)" style="width:140px;">
                <input class="hobby-name" value="${aEsc(item.name || "")}" placeholder="Hobby name" style="flex:1;">
                <button class="danger remove-hobby" style="flex-shrink:0;">✕</button>
            </div>
            <textarea class="hobby-note" rows="2" style="width:100%;resize:vertical;" placeholder="Short description…">${aEsc(item.note || "")}</textarea>
        </div>`;
}

function wireAddHobby() {
    document.getElementById("addHobby").onclick = () => {
        const container = document.getElementById("hobbyItems");
        const idx = container.children.length;
        container.insertAdjacentHTML("beforeend", hobbyRow({}, idx));
        wireRemoveHobby();
    };
    wireRemoveHobby();
}

function wireRemoveHobby() {
    document.querySelectorAll(".remove-hobby").forEach(btn => {
        btn.onclick = () => btn.closest(".hobby-row").remove();
    });
}

function collectHobbies() {
    return [...document.querySelectorAll(".hobby-row")].map(row => ({
        icon: row.querySelector(".hobby-icon").value.trim(),
        name: row.querySelector(".hobby-name").value.trim(),
        note: row.querySelector(".hobby-note").value.trim(),
    })).filter(e => e.name);
}

// ════════════════════════════════════════════════════════════════
// SAVE
// ════════════════════════════════════════════════════════════════
async function saveAbout() {
    const btn = document.getElementById("saveAbout");
    btn.disabled = true;
    btn.textContent = "Saving…";
    try {
        const payload = {
            bio:        collectBio(),
            skills:     collectSkills(),
            currently:  collectCurrently(),
            experience: collectExperience(),
            hobbies:    collectHobbies(),
        };
        await apiFetch("/api/about", {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        showAboutStatus("Saved! Reload the portfolio to see changes.", "ok");
    } catch (err) {
        showAboutStatus("Save failed: " + err.message, "error");
    } finally {
        btn.disabled = false;
        btn.textContent = "Save All Changes";
    }
}

window.AboutEditor = { renderAboutEditor };