async function loadTagPicker() {
    const tags = await apiFetch("/api/tags");
    const picker = document.getElementById("tagPicker");
    picker.innerHTML = tags.map(tag => `
        <label class="tag-option">
            <input
                type="checkbox"
                value="${tag.name}"
                data-color="${tag.color}">
            <span
                class="tag-swatch"
                style="background:${tag.color}">
            </span>
            ${tag.name}
        </label>
    `).join("");
    picker
        .querySelectorAll("input")
        .forEach(box => {
            box.onchange = () => {
                // Only allow one checked tag
                picker
                    .querySelectorAll("input")
                    .forEach(other => {
                        if (other !== box) {
                            other.checked = false;
                        }
                    });
                updatePreview();
            };
    });
}

function getSelectedTags() {
    return [
        ...document.querySelectorAll(
            "#tagPicker input:checked"
        )
    ].map(box => ({
        name: box.value,
        color: box.dataset.color || "#2563eb"
    }));
}

function getSelectedTagNames() {
    // Convenience for callers that only need the names
    // (e.g. the editor's "tag: <name>" payload).
    return getSelectedTags().map(t => t.name);
}

window.BlogTags = {
    loadTagPicker,
    getSelectedTags,
    getSelectedTagNames
};