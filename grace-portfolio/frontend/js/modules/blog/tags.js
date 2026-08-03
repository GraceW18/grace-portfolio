async function loadTagPicker() {
    const tags =
        await apiFetch("/api/tags");
    const picker =
        document.getElementById("tagPicker");
    picker.innerHTML =
        tags.map(tag => `
            <label class="tag-option">
                <input
                    type="checkbox"
                    value="${tag.name}">
                ${tag.name}
            </label>
        `).join("");
    picker
        .querySelectorAll("input")
        .forEach(box => {
            box.onchange = updatePreview;
        });
}

function getSelectedTags() {
    return [
        ...document.querySelectorAll(
            "#tagPicker input:checked"
        )
    ].map(box => box.value);
}

window.BlogTags = {
    loadTagPicker,
    getSelectedTags
};