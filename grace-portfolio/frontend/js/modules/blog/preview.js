function updatePreview() {
    const title =
        document.getElementById("postTitle").value;
    const date =
        document.getElementById("postDate").value;
    const excerpt =
        document.getElementById("postExcerpt").value;
    const content =
        document.getElementById("postContent").value;
    document
        .getElementById("livePreview")
        .innerHTML =
            createPreviewHTML(
                title,
                date,
                excerpt,
                content,
                BlogTags.getSelectedTags()
            );
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