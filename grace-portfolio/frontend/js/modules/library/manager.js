/* Grace Studio — Library Manager
 * Lists, creates, edits, and deletes book/paper/article reviews.
 */

async function renderLibraryManager() {
    const content = document.getElementById("studio-content");
    content.innerHTML =
        StudioUI.pageHeader("Library", "+ New Review", "newReview")
        + StudioUI.card(`<div id="reviewsTable">${StudioUI.loading("Loading reviews...")}</div>`);

    document.getElementById("newReview").onclick = () => renderReviewEditor();
    loadReviewsTable();
}

async function loadReviewsTable() {
    const table = document.getElementById("reviewsTable");
    try {
        const reviews = await BlogAPI.fetchReviews();
        if (!reviews.length) {
            table.innerHTML = StudioUI.empty("No reviews yet", "Add your first book, paper, or article review.");
            return;
        }
        table.innerHTML = `
            <table class="studio-table">
                <thead><tr>
                    <th>Cover</th><th>Title</th><th>Type</th>
                    <th>Tags</th><th>Rating</th><th></th>
                </tr></thead>
                <tbody>${reviews.map(createReviewRow).join("")}</tbody>
            </table>`;
        if (window.lucide) lucide.createIcons();
        table.querySelectorAll(".editReview").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                const review = reviews.find(r => r.id === id);
                renderReviewEditor(review);
            };
        });
        table.querySelectorAll(".deleteReview").forEach(btn => {
            btn.onclick = async () => {
                const id = Number(btn.dataset.id);
                const r = reviews.find(r => r.id === id);
                const confirmed = await AdminUI.confirm(
                    "Delete Review",
                    `<strong>${escapeHTML(r.title)}</strong><br><br>This cannot be undone.`
                );
                if (!confirmed) return;
                try {
                    await BlogAPI.deleteReview(id);
                    loadReviewsTable();
                } catch (err) { alert(err.message); }
            };
        });
    } catch (err) {
        table.innerHTML = `<p style="color:var(--danger);">${escapeHTML(err.message)}</p>`;
    }
}

function createReviewRow(r) {
    const tagChips = (r.tags || []).map(t => `
        <span class="b-tag" style="background:${hexToBg(t.color)};color:${t.color};border:1px solid ${t.color}33;">
            ${escapeHTML(t.name)}
        </span>`).join(" ");
    const cover = r.cover_url
        ? `<img src="${escapeAttr(r.cover_url)}" style="width:36px;height:50px;object-fit:cover;border-radius:3px;">`
        : `<div style="width:36px;height:50px;background:var(--surface);border-radius:3px;border:1px solid var(--border);"></div>`;
    return `
        <tr>
            <td>${cover}</td>
            <td><strong>${escapeHTML(r.title)}</strong><br><span style="color:var(--muted);font-size:.8rem;">${escapeHTML(r.author||'')}</span></td>
            <td><span class="bk-type-badge bkt-${r.type||'book'}">${r.type||''}</span></td>
            <td>${tagChips}</td>
            <td>${escapeHTML(r.rating||'')}</td>
            <td class="studio-row-actions">
                <button class="editReview" data-id="${r.id}">Edit</button>
                <button class="deleteReview danger" data-id="${r.id}">Delete</button>
            </td>
        </tr>`;
}

async function renderReviewEditor(review = null) {
    const content = document.getElementById("studio-content");
    const isEdit = !!review;
    content.innerHTML = `
        <button id="backLibrary">← Back</button>
        <div class="editor-layout">
            <section class="editor-form">
                <h1>${isEdit ? "Edit Review" : "New Review"}</h1>

                <label>Title</label>
                <input id="rvTitle" value="${escapeAttr(review?.title || '')}">

                <label>Author</label>
                <input id="rvAuthor" value="${escapeAttr(review?.author || '')}">

                <label>Type</label>
                <select id="rvType">
                    ${['book','paper','article'].map(t =>
                        `<option value="${t}" ${review?.type===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`
                    ).join('')}
                </select>

                <label>Cover Image URL</label>
                <input id="rvCover" placeholder="https://..." value="${escapeAttr(review?.cover_url || '')}">
                <div id="coverPreview" style="margin-top:8px;"></div>

                <label>Rating (e.g. ★★★★★)</label>
                <input id="rvRating" value="${escapeAttr(review?.rating || '')}">

                <label>Status (e.g. Rereading, Essential)</label>
                <input id="rvStatus" value="${escapeAttr(review?.status || '')}">

                <label>Accent Color</label>
                <select id="rvAccent">
                    ${['indigo','teal','amber'].map(a =>
                        `<option value="${a}" ${review?.accent===a?'selected':''}>${a.charAt(0).toUpperCase()+a.slice(1)}</option>`
                    ).join('')}
                </select>

                <label>Review</label>
                <textarea id="rvReview" rows="6">${escapeHTML(review?.review || '')}</textarea>

                <label>Tags</label>
                <div id="reviewTagPicker">Loading tags…</div>

                <hr>
                <button id="publishReview">${isEdit ? "Save Changes" : "Publish"}</button>
            </section>
            <section class="editor-preview" id="reviewPreview">
                <p style="color:var(--muted);font-size:.85rem;">Cover preview will appear here.</p>
            </section>
        </div>`;

    content.dataset.editingReviewId = isEdit ? review.id : "";
    document.getElementById("backLibrary").onclick = () => renderLibraryManager();

    // Load review tags into picker
    try {
        const tags = await BlogAPI.fetchReviewTags();
        const picker = document.getElementById("reviewTagPicker");
        if (!tags.length) {
            picker.innerHTML = `<p style="color:var(--muted);font-size:.85rem;">No review tags yet. Create some in Tag Manager.</p>`;
        } else {
            picker.innerHTML = tags.map(t => `
                <label style="display:flex;align-items:center;gap:8px;margin-bottom:6px;cursor:pointer;">
                    <input type="checkbox" value="${escapeAttr(t.name)}">
                    <span class="b-tag" style="background:${hexToBg(t.color)};color:${t.color};border:1px solid ${t.color}33;">
                        <i data-lucide="${escapeAttr(t.icon||'tag')}" style="width:11px;height:11px;vertical-align:-1px;margin-right:3px;"></i>
                        ${escapeHTML(t.name)}
                    </span>
                </label>`).join("");
            if (window.lucide) lucide.createIcons();

            // Pre-check tags for existing review
            if (review?.tags?.length) {
                review.tags.forEach(tag => {
                    const name = tag.name ?? tag;
                    const box = picker.querySelector(`input[value="${name}"]`);
                    if (box) box.checked = true;
                });
            }
        }
    } catch (err) {
        document.getElementById("reviewTagPicker").innerHTML =
            `<p style="color:var(--danger);">Couldn't load tags: ${escapeHTML(err.message)}</p>`;
    }

    // Cover preview
    const coverInput = document.getElementById("rvCover");
    const coverPreview = document.getElementById("coverPreview");
    function updateCoverPreview() {
        const url = coverInput.value.trim();
        coverPreview.innerHTML = url
            ? `<img src="${escapeAttr(url)}" style="max-height:120px;border-radius:4px;border:1px solid var(--border);" onerror="this.style.display='none'">`
            : '';
    }
    coverInput.addEventListener("input", updateCoverPreview);
    updateCoverPreview();

    document.getElementById("publishReview").onclick = publishReview;
}

async function publishReview() {
    const title     = document.getElementById("rvTitle").value.trim();
    const author    = document.getElementById("rvAuthor").value.trim();
    const type      = document.getElementById("rvType").value;
    const cover_url = document.getElementById("rvCover").value.trim();
    const rating    = document.getElementById("rvRating").value.trim();
    const status    = document.getElementById("rvStatus").value.trim();
    const accent    = document.getElementById("rvAccent").value;
    const review    = document.getElementById("rvReview").value.trim();
    const tags      = [...document.querySelectorAll("#reviewTagPicker input:checked")].map(cb => cb.value);

    if (!title) { alert("Title is required."); return; }

    const editingId = document.getElementById("studio-content").dataset.editingReviewId;
    try {
        if (editingId) {
            await BlogAPI.updateReview(editingId, { title, author, type, accent, rating, status, review, cover_url, tags });
            alert("Review updated!");
        } else {
            await BlogAPI.createReview({ title, author, type, accent, rating, status, review, cover_url, tags });
            alert("Review published!");
        }
        renderLibraryManager();
    } catch (err) {
        alert(err.message);
    }
}

function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s) { return escapeHTML(s); }
function hexToBg(hex) {
    if (!hex || !/^#?([0-9a-f]{6})$/i.test(hex)) return "#eee";
    const h = hex.replace("#","");
    return `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},0.12)`;
}

window.LibraryManager = { renderLibraryManager };