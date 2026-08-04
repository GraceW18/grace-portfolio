function updatePreview() {
    const preview = document.getElementById("livePreview");
    const title   = document.getElementById("postTitle").value;
    const date    = document.getElementById("postDate").value;
    const excerpt = document.getElementById("postExcerpt").value;
    const content = document.getElementById("postContent").value;
    const tags    = BlogTags.getSelectedTags();
    preview.innerHTML = `
        <div class="article-preview">
            <h1 class="article-title">${title || "Untitled Post"}</h1>
            <div class="article-meta">
                <span>${date}</span>
                ${tags.map(tag => `
                    <span
                        class="article-tag"
                        style="background:${hexToBg(tag.color)};color:${tag.color};border:1px solid ${tag.color}33;">
                        <i data-lucide="${escapeAttr(tag.icon || 'tag')}" style="width:11px;height:11px;vertical-align:-1px;margin-right:3px;"></i>
                        ${tag.name}
                    </span>
                `).join("")}
            </div>
            <p class="article-excerpt">${excerpt}</p>
            <div class="article-content">${marked.parse(content || "")}</div>
        </div>
    `;
    if (window.lucide) lucide.createIcons();
}

function hexToBg(hex) {
    if (!hex || !/^#?([0-9a-f]{6})$/i.test(hex)) return "#eee";
    const h = hex.replace("#", "");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return `rgba(${r},${g},${b},0.12)`;
}

function escapeHTML(s) {
    return String(s ?? "").replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
    }[c]));
}

function escapeAttr(s) {
    return escapeHTML(s);
}

function createPreviewHTML(title, date, excerpt, content, tags = []) {
    return `
        <h2>
            Live Preview
        </h2>
        <div class="blog-preview-card">
            <div class="preview-tags">
                ${tags.map(tag => `
                    <span class="preview-tag">
                        ${tag}
                    </span>
                `).join("")}
            </div>
            <small>
                ${date || "Date"}
            </small>
            <h3>
                ${title || "Untitled Post"}
            </h3>
            <p>
                ${excerpt || "Your excerpt appears here..."}
            </p>
            <hr>
            <div class="preview-content">
                ${(content || "").replace(/\n/g,"<br>")}
            </div>
        </div>
    `;
}

window.BlogPreview = {
    updatePreview
};