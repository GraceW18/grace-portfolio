async function renderEditor(post = null) {
    const content =
        document.getElementById("studio-content");
    content.innerHTML = `
        <button id="backBlog">
              ← Back
        </button>
        <div class="editor-layout">
            <section class="editor-form">
                <h1>
                    ${
                        post
                            ? "Edit Post"
                            : "New Blog Post"
                    }
                </h1>
                <label>
                    Title
                </label>
                <input
                    id="postTitle"
                    value="${post?.title || ""}">
                <label>
                    Date
                </label>
                <input
                    id="postDate"
                    value="${post?.date || ""}">
                <label>
                    Excerpt
                </label>
                <textarea
                    id="postExcerpt"
                    rows="6">${post?.excerpt || ""}</textarea>
                <label>
                    Content
                </label>
                <textarea
                    id="postContent"
                    rows="14"
                    placeholder="Write your article..."></textarea>
                <label>
                    Tags
                </label>
                <div id="tagPicker">
                    Loading tags...
                </div>
                <button
                    id="createTag">
                    + Create Tag
                </button>
                <hr>
                <button
                    id="publishPost">
                    Publish
                </button>
            </section>
            <section
                id="livePreview"
                class="editor-preview">
            </section>
        </div>
    `;
    await BlogTags.loadTagPicker();
    BlogPreview.updatePreview();
    wireEditor();
}

function wireEditor() {
    ["postTitle","postDate","postExcerpt", "postContent"]
        .forEach(id => {
            document
                .getElementById(id)
                .addEventListener(
                    "input",
                    updatePreview
                );
        });
    document
        .getElementById("backBlog")
        .onclick =
            () => Blog.renderManager();
    document
        .getElementById("publishPost")
        .onclick = publishPost;
}

async function publishPost() {
    const title =
        document.getElementById("postTitle").value.trim();
    const date =
        document.getElementById("postDate").value.trim();
    const excerpt =
        document.getElementById("postExcerpt").value.trim();
    const content =
        document.getElementById("postContent").value.trim();
    const tags =
        BlogTags.getSelectedTags();
    if (!title) {
        alert("Title required.");
        return;
    }
    if (!tags.length) {
        alert("Select at least one tag.");
        return;
    }
    try {
        await BlogAPI.createPost("/api/posts", {
            method: "POST",
            body: JSON.stringify({
                title,
                date,
                excerpt,
                content,
                tag: tags[0] // temporary until multi-tag backend
            })
        });
        alert("Published! 🎉");
        Blog.renderManager();
    }
    catch(err){
        alert(err.message);
    }
}

window.BlogEditor = {
    renderEditor
};