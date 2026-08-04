document.addEventListener(
    "DOMContentLoaded",
    loadArticle
);
async function loadArticle() {
    const params =
        new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (!id) {
        document.getElementById("article").innerHTML =
            "<h1>Article not found.</h1>";
        return;
    }
    try {
        const post =
            await apiFetch(`/api/posts/${id}`);
        renderArticle(post);
        document.getElementById("backBtn").onclick = (e) => {
            e.preventDefault();
            history.back();
        };
    }
    catch {
        document.getElementById("article").innerHTML =
            "<h1>Article not found.</h1>";
    }
}
function renderArticle(post) {
    document.getElementById("article").innerHTML = `
    <div class="article-container">
        <a href="#" id="backBtn" class="article-back">← Back</a>
        <h1 class="article-title">${post.title}</h1>
        <div class="article-meta">${post.date}</div>
                <div class="article-tags">
            ${(post.tags || []).map(tag => {
                const name  = tag.name  ?? tag;
                const color = tag.color || '#2563eb';
                const icon  = tag.icon  || 'tag';
                return `
            <span
                class="article-tag"
                style="background:${hexToBg(color)};color:${color};border:1px solid ${color}33;">
                <i data-lucide="${escapeAttr(icon)}" style="width:11px;height:11px;vertical-align:-1px;margin-right:3px;"></i>
                ${name}
            </span>`;
            }).join("")}
        </div>
        <div class="article-content">${marked.parse(post.content || "")}</div>
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

window.addEventListener("scroll", () => {
    const progress =
        document.querySelector(".read-progress");
    if (!progress) return;
    const max =
        document.body.scrollHeight -
        window.innerHeight;
    const pct =
        max > 0
            ? window.scrollY / max
            : 0;
    progress.style.width =
        `${pct * 100}%`;
});