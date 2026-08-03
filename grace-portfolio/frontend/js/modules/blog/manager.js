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
}

function createPostRow(post) {
    return `
        <tr>
            <td>${post.title}</td>
            <td>${post.tag}</td>
            <td>${post.date}</td>
            <td>
                <button>Edit</button>
                <button>Delete</button>
            </td>
        </tr>
    `;
}

window.BlogManager = {
    renderManager,
    loadPosts
};