/* Grace Studio UI Library */

window.StudioUI = {
    loading,
    empty,
    card,
    pageHeader
};

function loading(text = "Loading...") {
    return `
        <div class="studio-loading">
            ${text}
        </div>
    `;
}

function empty(title, subtitle = "") {
    return `
        <div class="studio-empty">
            <h2>${title}</h2>
            <p>${subtitle}</p>
        </div>
    `;
}

function card(content) {
    return `
        <div class="studio-card">
            ${content}
        </div>
    `;
}

function pageHeader(title, buttonText, buttonID) {
    return `
        <div class="studio-page-header">
            <div>
                <h1>${title}</h1>
            </div>
            <button id="${buttonID}">
                ${buttonText}
            </button>
        </div>
    `;
}