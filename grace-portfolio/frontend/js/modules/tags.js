/* Grace Studio — Tag Manager
 *
 * Lists, creates, edits, and deletes tags.
 * Renders color chips inline so admins can see the live look.
 */
async function renderTagManager() {
    const content = document.getElementById("studio-content");
    content.innerHTML =
        StudioUI.pageHeader("Tags", "+ New Tag", "newTag")
        + StudioUI.card(`
            <div id="tagsTable">
                ${StudioUI.loading("Loading tags...")}
            </div>
        `);

    document.getElementById("newTag").onclick = () => openTagForm();
    loadTags();
}

async function loadTags() {
    const table = document.getElementById("tagsTable");
    try {
        const tags = await BlogAPI.fetchTags();
        renderTagTable(tags);
    } catch (err) {
        table.innerHTML = `<p style="color:var(--danger);">${escapeHTML(err.message)}</p>`;
    }
}

function renderTagTable(tags) {
    const table = document.getElementById("tagsTable");
    if (!tags.length) {
        table.innerHTML = StudioUI.empty("No tags yet", "Create your first tag to organize posts.");
        return;
    }

    table.innerHTML = `
        <table class="studio-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Color</th>
                    <th>Created</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${tags.map(t => `
                    <tr>
                        <td>
                            <span class="b-tag"
                                  style="background:${hexToBg(t.color)};color:${t.color};border:1px solid ${t.color}33;">
                                ${escapeHTML(t.name)}
                            </span>
                        </td>
                        <td>
                            <span class="tag-swatch" style="background:${t.color};"></span>
                            <code>${escapeHTML(t.color)}</code>
                        </td>
                        <td>${formatDate(t.created_at)}</td>
                        <td class="studio-row-actions">
                            <button class="editTag" data-id="${t.id}">Edit</button>
                            <button class="deleteTag danger" data-id="${t.id}">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>
    `;

    table.querySelectorAll(".editTag").forEach(btn => {
        btn.onclick = () => {
            const id = Number(btn.dataset.id);
            const tag = tags.find(t => t.id === id);
            openTagForm(tag);
        };
    });

    table.querySelectorAll(".deleteTag").forEach(btn => {
        btn.onclick = async () => {
            const id = Number(btn.dataset.id);
            const tag = tags.find(t => t.id === id);
            const confirmed = await AdminUI.confirm(
                "Delete Tag",
                `<strong>${escapeHTML(tag.name)}</strong><br><br>
                 Posts will lose this tag from their filter chips.
                 The posts themselves are kept. This action cannot be undone.`
            );
            if (!confirmed) return;
            try {
                await BlogAPI.deleteTag(id);
                loadTags();
            } catch (err) {
                alert(err.message);
            }
        };
    });
}

function openTagForm(tag = null) {
    const isEdit = !!tag;
    AdminUI.showModal(
        isEdit ? "Edit Tag" : "New Tag",
        `
        <form id="tagForm" class="studio-form">
            <label>
                Name
                <input id="tagName" type="text" required
                    value="${isEdit ? escapeHTML(tag.name) : ""}"
                    placeholder="e.g. ai">
            </label>
            <label>
                Color
                <input id="tagColor" type="color"
                    value="${isEdit ? escapeHTML(tag.color) : "#2563eb"}">
            </label>
            <div class="admin-modal-actions">
                <button type="button" id="cancelTag">Cancel</button>
                <button type="submit" class="primary">${isEdit ? "Save" : "Create"}</button>
            </div>
        </form>
        `
    );

    document.getElementById("cancelTag").onclick = () => AdminUI.closeModal();
    document.getElementById("tagForm").onsubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById("tagName").value.trim();
        const color = document.getElementById("tagColor").value;
        try {
            if (isEdit) {
                await BlogAPI.updateTag(tag.id, { name, color });
            } else {
                await BlogAPI.createTag(name, color);
            }
            AdminUI.closeModal();
            loadTags();
        } catch (err) {
            alert(err.message);
        }
    };
}

function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric"
    });
}

function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    }[c]));
}

function hexToBg(hex) {
    if (!hex || !/^#?([0-9a-f]{6})$/i.test(hex)) return "#eee";
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},0.12)`;
}

window.TagManager = { renderTagManager };