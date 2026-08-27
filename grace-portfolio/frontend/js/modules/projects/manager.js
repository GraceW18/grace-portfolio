/* Projects Manager */

async function renderProjectsManager() {
    const content = document.getElementById("studio-content");
    content.innerHTML = 
        StudioUI.pageHeader("Projects", "+ New Project", "newProject")
        + StudioUI.card(`<div id="projectsTable">${StudioUI.loading("Loading projects...")}</div>`);
    document.getElementById("newProject").onclick = () => renderProjectEditor();
    loadProjectsTable();
}

async function loadProjectsTable() {
    const table = document.getElementById("projectsTable");
    try {
        const projects = await BlogAPI.fetchProjects();
        if (!projects.length) {
            table.innerHTML = StudioUI.empty("No projects yet", "Add your first project to the Projects page.");
            return;
        }
        table.innerHTML = `
            <table class="studio-table">
                <thead><tr>
                    <th>Order</th><th>Title</th><th>Type</th>
                    <th>Tags</th><th>Accent</th><th></th>
                </tr></thead>
                <tbody>${projects.map(createProjectRow).join("")}</tbody>
            </table>`;
        if (window.lucide) lucide.createIcons();
        table.querySelectorAll(".editProject").forEach(btn => {
            btn.onclick = () => {
                const id = Number(btn.dataset.id);
                const project = projects.find(p => p.id === id);
                renderProjectEditor(project);
            };
        });
        table.querySelectorAll(".deleteProject").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                const p = projects.find(p => p.id === id);
                const confirmed = await AdminUI.confirm(
                    "Delete Project",
                    `<strong>${pEsc(p.title)}</strong><br><br>This cannot be undonw.`
                );
                if (!confirmed) return;
                try {
                    await BlogAPI.deleteProject(id);
                    loadProjectsTable();
                } catch (err) { alert(err.message); }
            };
        });
    } catch (err) {
        table.innerHTML = `<p style="color:var(--danger);">${pEsc(err.message)}</p>`;
    }
}

function createProjectRow(p) {
    const tagChips = (p.tags || []).map(t => `
        <span class="b-tag" style="background:${hexToBgP(t.color)};color:${t.color};border:1px solid ${t.color}33;">
            ${pEsc(t.name)}
        </span>`).join(" ");
    return `
        <tr>
            <td>${p.display_order ?? 0}</td>
            <td><strong>${pEsc(p.title)}</strong><br><span style="color:var(--muted);font-size:.8rem;">${pEsc(p.summary||'')}</span></td>
            <td><span style="font-size:.72rem;color:var(--muted);">${pEsc(p.type_label||'')}</span></td>
            <td>${tagChips}</td>
            <td><span class="b-tag" style="text-transform:capitalize;">${pEsc(p.accent||'indigo')}</span></td>
            <td class="studio-row-actions">
                <button class="editProject" data-id="${p.id}">Edit</button>
                <button class="deleteProject danger" data-id="${p.id}">Delete</button>
            </td>
        </tr>`;  
}

async function renderProjectEditor(project = null) {
    const content = document.getElementById("studio-content");
    const isEdit = !!project;
    const links = Array.isArray(project?.links) ? project.links : [];

    content.innerHTML = `
        <button id="backProjects">← Back</button>
        <div class="editor-layout">
            <section class="editor-form">
                <h1>${isEdit ? "edit Project" : "New Project"}</h1>
                <label>Project Title</label>
                <input id="pjTitle" placeholder="e.g. Multi-Agent AI Travel Planner" value="${pAttr(project?.title || '')}">

                <label>One-sentence Summary (project goal)</label>
                <input id="pjSummary" placeholder="What does this project do, in one sentence?" value="${pAttr(project?.summary || '')}">

                <label>Type / Kicker <span style="color:var(--muted);font-weight:400;">(shown above the title, e.g. "AI / Backend - Google")</span></label>
                <input id="pjType" value="${pAttr(project?.type_label || '')}">

                <label>The Problem <span style="color:var(--muted);font-weight:400;">what issue this solves, or why you built it</span></label>
                <textarea id="pjProblem" rows="3">${pEsc(project?.problem || '')}</textarea>
                
                <label>Your Role <span style="color:var(--muted);font-weight:400;">your specific contributions</span></label>
                <textarea id="pjRole" rows="3">${pEsc(project?.role || '')}</textarea>

                <label>Tech Stack <span style="color:var(--muted);font-weight:400;">comma-separated languages &amp; tools</span></label>
                <input id="pjStack" placeholder="Python, Google ADK, Vertex AI, BigQuery" value="${pAttr(project?.tech_stack || '')}">

                <label>Quantifiable Results</label>
                <textarea id="pjResults" rows="2" placeholder="e.g. ~90% cost reduction; 5th place at MedTech Hack">${pEsc(project?.results || '')}</textarea>

                <label>Engineering Trade-offs</label>
                <textarea id="pjTradeoffs" rows="2" placeholder="What did you choose to prioritize, and what did it cost?">${pEsc(project?.tradeoffs || '')}</textarea>

                <label>Technical Challenge</label>
                <textarea id="pjChallenge" rows="2" placeholder="The hardest problem you had to solve">${pEsc(project?.challenge || '')}</textarea>

                <label>Accent Color</label>
                <select id="pjAccent">
                    ${['indigo', 'teal'].map(a =>
                        `<option value="${a}" ${project?.accent===a?'selected':''}>${a.charAt(0).toUpperCase()+a.slice(1)}</option>`
                    ).join('')}
                </select>

                <label>Display Order <span style="color:var(--muted);font-weight:400;">(lowershows first)</span></label>
                <input id="pjOrder" type="number" value="${project?.display_order ?? 0}">

                <label>Links</label>
                <div id="pjLinks"></div>
                <button type="button" id="pjAddLink" style="margin-top:6px;">+ Add Link</button>

                <label style="margin-top:16px;">Tags</label>
                <div id="projectTagPicker">Loading tags...</div>

                <hr>
                <button id="publishProject">${isEdit ? "Save Changes" : "Publish"}</button>
            </section>
            <section class="editor-preview" id="projectPreview"></section>
        </div>`;
    content.dataset.editingProjectId = isEdit ? project.id : "";
    document.getElementById("backProjects").onclick = () =>renderProjectsManager();

    // Links repeater
    const  linksWrap = document.getElementById("pjLinks");
    function addLinkRow(label = "", url = "") {
        const row = document.createElement("div");
        row.className = "pj-link-row";
        row.style.cssText = "display:flex;gap:8px;margin-bottom:6px;";
        row.innerHTML = `
            <input class="pjLinkLabel" placeholder="Label (e.g. GitHub)" value="${pAttr(label)}" style="flex:1;">
            <input class="pjLinkUrl" placeholder="https://..." value="${pAttr(url)}" style="flex:2;">
            <button type="button" class="pjRemoveLink danger"> X </button>
        `;
        row.querySelector(".pjRemoveLink").onclick = () => row.remove();
        linksWrap.appendChild(row);
    }
    links.forEach(l => addLinkRow(l.label || '', l.url || ''));
    if (!links.length) addLinkRow();
    document.getElementById("pjAddLink").onclick = () => addLinkRow();

    // Tag Picker
    try{
        const tags = await BlogAPI.fetchProjectTags();
        const picker = document.getElementById("projectTagPicker");
        if (!tags.length) {
            picker.innerHTML = `<p style="color:var(--muted);font-size:.85rem;">No project tags yet. Create some in Tag Manager.</p>`;
        } else {
            picker.innerHTML = tags.map(t => `
                <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;">
                    <input type="checkbox" value="${pAttr(t.name)}">
                    <span class="b-tag" style="background:${hexToBgP(t.color)};color:${t.color};border:1px solid ${t.color}33;">
                        <i data-lucide="${pAttr(t.icon||'tag')}" style="width:11px;height:11px;vertical-align:-1px;margin-right:3px;"></i>
                        ${pEsc(t.name)}
                    </span>
                </label>`).join("");
            if (window.lucide) lucide.createIcons();
            if (project?.tags?.length) {
                project.tags.forEach(tag => {
                    const name = tag.name ?? tag;
                    const box = picker.querySelector(`input[value="${name}"]`);
                    if (box) box.checked = true;
                });
            }
        }
    } catch (err) {
        document.getElementById("projectTagPicker").innerHTML =
            `<p style="color:var(--danger);">Couldn't load tags: ${pEsc(err.message)}</p>`;
    }

    // Live Preview
    const preview = document.getElementById("projectPreview");
    function updatePreview() {
        const title = document.getElementById("pjTitle").value.trim() || "Untitled Project";
        const type = document.getElementById("pjType").value.trim();
        const summary = document.getElementById("pjSummary").value.trim();
        const stack = document.getElementById("pjStack").value.trim();
        const accent = document.getElementById("pjAccent").value;
        const chips = stack ? stack.split(',').map(s => s.trim()).filter(Boolean)
            .map(s => `<span class="tech-chip">${pEsc(s)}</span>`).join('') : '';
        preview.innerHTML = `
            <div class="project-card" data-accent="${accent}" style="break-inside:avoid;">
                ${type ? `<div class="p-type">${pEsc(type)}</div>` : ''}
                <div class="p-title">${pEsc(title)}</div>
                ${summary ? `<div class="p-desc">${pEsc(summary)}</div>` : ''}
                ${chips ? `<div class="tech-chips">${chips}</div>` : ''}
            </div>
            <p style="color:var(--muted);font-size:.78rem;margin-top:10px;">Live preview of the card header. Full details (Problem, Role, Results, Trade-offs, Challenge) expand on the public page.</p>
        `;
    }
    ["pjTitle", "pjType", "pjSummary", "pjStack", "pjAccent"].forEach(id =>
        document.getElementById(id).addEventListener("input", updatePreview)
    );
    updatePreview();
    document.getElementById("publishProject").onclick = publishProject;
}

async function publishProject() {
    const title = document.getElementById("pjTitle").value.trim();
    const type_label = document.getElementById("pjType").value.trim();
    const summary = document.getElementById("pjSummary").value.trim();
    const problem = document.getElementById("pjProblem").value.trim();
    const role = document.getElementById("pjRole").value;
    const tech_stack = document.getElementById("pjStack").value.trim();
    const results = document.getElementById("pjResults").value.trim();
    const tradeoffs = document.getElementById("pjTradeoffs").value.trim();
    const challenge = document.getElementById("pjChallenge").value.trim();
    const accent = document.getElementById("pjAccent").value;
    const display_order = Number(document.getElementById("pjOrder").value) || 0;
    const tags = [...document.querySelectorAll("#projectTagPicker input:checked")].map(cb => cb.value);

    const links = [...document.querySelectorAll("#pjLinks .pj-link-row")].map(row => ({
        label: row.querySelector(".pjLinkLabel").value.trim(),
        url: row.querySelector(".pjLinkUrl").value.trim()
    })).filter(l => l.label && l.url);

    if (!title) { alert("Project title is required."); return; }

    const payload = {
        title, summary, type_label, problem, role, tech_stack,
        results, tradeoffs, challenge, accent, links, display_order, tags
    }

    const editingId = document.getElementById("studio-content").dataset.editingProjectId;
    try {
        if (editingId) {
            await BlogAPI.updateProject(editingId, payload);
            alert("Project updated!");
        } else {
            await BlogAPI.createProject(payload);
            alert("Project published!");
        }
        renderProjectsManager();
    } catch (err) {
        alert(err.message);
    }
}

function pEsc(s) {
    return String(s ?? "").replace(/[&<>"']/g, c=> ({"&":"&amp;", "<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function pAttr(s) { return pEsc(s); }
function hexToBgP(hex) {
    if (!hex || !/^#?([0-9a-f]{6})$/i.test(hex)) return "#eee";
    const h = hex.replace("#","");
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},0.12)`;
}

window.ProjectsManager = { renderProjectsManager };