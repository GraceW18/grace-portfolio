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
                <button id="publishPost">
                    ${
                        post
                            ? "Save Changes"
                            : "Publish"
                    }
                </button>
            </section>
            <section
                id="livePreview"
                class="editor-preview">
            </section>
        </div>
    `;
    content.dataset.editingId =
    post
        ? post.id
        : "";
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
    document
        .getElementById("createTag")
        .onclick =
            showCreateTagDialog;
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
        const editingId =
            document
                .getElementById("studio-content")
                .dataset
                .editingId;
        console.log("Selected tags:", tags);
        console.log("Sending tag:", tags[0]);
        if (editingId) {
            await BlogAPI.updatePost(
                editingId,
                {
                    title,
                    date,
                    excerpt,
                    content,
                    tag: tags[0]
                }
            );
            alert("Post updated!");
        }
        else {
            await BlogAPI.createPost({
                title,
                date,
                excerpt,
                content,
                tag: tags[0]
            });
            alert("Post published!");
        }
        Blog.renderManager();
    }
    catch(err){
        alert(err.message);
    }
}

async function showCreateTagDialog() {
    const modal = AdminUI.showModal(
        "Create Tag",
        `
        <label>Tag Name</label>
        <input
            id="newTagName"
            placeholder="Machine Learning">
        <label style="margin-top:16px;display:block;">
            Color
        </label>
        <input
            id="newTagColor"
            type="color"
            value="#2563eb">
        <div class="admin-modal-actions">
            <button id="cancelTag">
                Cancel
            </button>
            <button id="saveTag">
                Create Tag
            </button>
        </div>
        `
    );
    modal
        .querySelector("#cancelTag")
        .onclick =
            () => AdminUI.closeModal();
    modal
        .querySelector("#saveTag")
        .onclick =
            createNewTag;
}

async function createNewTag() {
    const name =
        document
            .getElementById("newTagName")
            .value
            .trim();
    const color =
        document
            .getElementById("newTagColor")
            .value;
    if (!name) {
        alert("Please enter a tag name.");
        return;
    }
    try {
        const tags =
            await BlogAPI.createTag(
                name,
                color
            );
        AdminUI.closeModal();
        await BlogTags.loadTagPicker();
        if (post?.tags) {
            post.tags.forEach(tagName => {
                const checkbox =
                    document.querySelector(
                        `#tagPicker input[value="${tagName}"]`
                    );
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
        }
        BlogPreview.updatePreview();
    }
    catch (err) {
        alert(err.message);
    }
}

window.BlogEditor = {
    renderEditor
};