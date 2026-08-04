/* Grace Studio */

document.addEventListener("DOMContentLoaded", initializeStudio);
function initializeStudio() {
    const token = localStorage.getItem("jwt");
    if (token) {
        renderDashboard();
    }
    else {
        renderLogin();
    }
}

/* Login Screen */

function renderLogin() {
    const app = document.getElementById("studio-app");
    app.innerHTML = `
        <div class="login-page">
            <div class="login-card">
                <h1>Grace Studio</h1>
                <p>
                    Sign in to manage your portfolio.
                </p>

                <input
                    id="password"
                    type="password"
                    placeholder="Password">

                <button id="loginButton">
                    Sign In
                </button>
            </div>
        </div>
    `;
    document
        .getElementById("loginButton")
        .addEventListener("click", login);
    document
    .getElementById("password")
    .addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            login();
        }
    });
}

async function login() {

    const password = document.getElementById("password").value;
    console.log("Starting login...");
    console.log("Password length:", password.length);

    try {
            const result = await apiFetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ password })
        });
        console.log("Server returned:", result);
        localStorage.setItem("jwt", result.token);
        renderDashboard();
    } catch (err) {
        console.error("Login failed:", err);
        alert(err.message);
    }
}

function logout() {
    localStorage.removeItem("jwt");
    renderLogin();
}

/* Dashboard */
function renderDashboard() {
    const app = document.getElementById("studio-app");
    app.innerHTML = `
        <div class="studio-layout">
            <aside class="studio-sidebar">
                <h2>
                    Grace Studio
                </h2>
                <button data-page="dashboard">
                    Dashboard
                </button>
                <button data-page="blog">
                    Blog
                </button>
                <button data-page="library">
                    Library
                </button>
                <button data-page="tags">
                    Tags
                </button>
                <button data-page="about">
                    About
                </button>
                <button data-page="messages">
                    Messages
                </button>
                <hr>
                <button id="logout">
                    Logout
                </button>
            </aside>
            <main
                id="studio-content"
                class="studio-content">
            </main>
        </div>
    `;
    document
        .getElementById("logout")
        .addEventListener("click", logout);
    document
    .querySelectorAll("[data-page]")
    .forEach(button => {

        button.addEventListener("click", () => {
            const page = button.dataset.page;
            switch (page) {
                case "dashboard":
                    Dashboard.renderHome();
                    break;
                case "blog":
                    Blog.renderManager();
                    break;
                case "library":
                    // later
                    break;
                case "tags":
                    TagManager.renderTagManager();
                    break;
                case "about":
                    // later
                    break;
                case "messages":
                    // later
                    break;
            }
        });
    });
    Dashboard.renderHome();
}