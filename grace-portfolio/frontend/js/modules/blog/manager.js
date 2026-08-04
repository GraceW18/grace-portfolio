async function renderManager() {
    const content =
        document.getElementById("studio-content");
    content.innerHTML =
        StudioUI.pageHeader(
            "Blog Manager",
            "+ New Post",
            "newPost"
        )
        +
        StudioUI.card(`
            <div id="postsTable">
                ${StudioUI.loading("Loading posts...")}
            </div>
        `)
    BlogManager.loadPosts();
    document
        .getElementById("newPost")
        .onclick =
            () => Blog.renderEditor();
}

async function loadPosts() {
    const posts = await BlogAPI.fetchPosts();
    const table =
        document.getElementById("postsTable");
    if (!posts.length) {
        table.innerHTML =
            "<p>No posts yet.</p>";
        return;
    }
    table.innerHTML = `
        <table class="studio-table">
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Tag</th>
                    <th>Date</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                ${posts.map(createPostRow).join("")}
            </tbody>
        </table>
    `;
    document
        .querySelectorAll(".editPost")
        .forEach(button => {

            button.onclick = () => {

                const id = Number(button.dataset.id);

                const post =
                    posts.find(p => p.id === id);

                Blog.renderEditor(post);

            };

        });
    document
    .querySelectorAll(".deletePost")
    .forEach(button => {
        button.onclick = async () => {
            const id = Number(button.dataset.id);
            const post =
                posts.find(p => p.id === id);
            const confirmed =
                await AdminUI.confirm(
                    "Delete Post",
                    `
                    <strong>${post.title}</strong>
                    <br><br>
                    This action cannot be undone.
                    `
                );
            if (!confirmed) return;
            try {
                await BlogAPI.deletePost(id);
                alert("Post deleted.");
                loadPosts();
            }
            catch (err) {
                alert(err.message);
            }
        };
    });
}

function createPostRow(post) {
    const tagChips = (post.tags || [])
        .map(t => `
            <span
                class="b-tag"
                style="background:${hexToBg(t.color)};color:${t.color};border:1px solid ${t.color}33;">
                ${escapeHTML(t.name)}
            </span>
        `)
        .join(" ");
    return `
        <tr>
            <td>${escapeHTML(post.title)}</td>
            <td>${tagChips}</td>
            <td>${escapeHTML(post.date)}</td>
            <td>
                <button class="editPost" data-id="${post.id}">Edit</button>
                <button class="deletePost" data-id="${post.id}">Delete</button>
            </td>
        </tr>
    `;
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

window.BlogManager = {
    renderManager,
    loadPosts
};