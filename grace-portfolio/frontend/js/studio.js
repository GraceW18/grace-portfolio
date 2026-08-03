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
    renderDashboardHome();
}

function renderDashboardHome() {
    const content = document.getElementById("studio-content");
    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) {
        greeting = "Good Morning";
    }
    else if (hour < 18) {
        greeting = "Good Afternoon";
    }
    const today = new Date().toLocaleDateString(
        undefined,
        {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric"
        }
    );
    content.innerHTML = `
        <div class="dashboard-header">
            <h1>${greeting}, Grace! </h1>
            <p>${today}</p>
        </div>
        <section class="overview-grid">
            <div class="overview-card">
                <h2 id="stat-posts">--</h2>
                <span>Blog Posts</span>
            </div>
            <div class="overview-card">
                <h2 id="stat-books">--</h2>
                <span>Library Entries</span>
            </div>
            <div class="overview-card">
                <h2 id="stat-tags">--</h2>
                <span>Tags</span>
            </div>
            <div class="overview-card">
                <h2 id="stat-messages">--</h2>
                <span>Messages</span>
            </div>
        </section>
        <section class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="action-grid">
                <button id="newPostBtn">
                    New Blog Post
                </button>
                <button id="newBookBtn">
                    Add Library Entry
                </button>
                <button id="editCurrentBtn">
                    Edit Currently
                </button>
                <button id="manageTagsBtn">
                    Manage Tags
                </button>
            </div>
        </section>
        <section class="recent-section">
            <h2>Recent Activity</h2>
            <ul id="recentActivity">
                <li>Studio initialized.</li>
            </ul>
        </section>
    `;
    loadDashboardStats();
}

async function loadDashboardStats() {
    try {
        const posts = await apiFetch("/api/posts");
        const tags = await apiFetch("/api/tags");
        const books = await apiFetch("/api/reviews");
        document.getElementById("stat-posts").textContent =
            posts.length;
        document.getElementById("stat-books").textContent =
            books.length;
        document.getElementById("stat-tags").textContent =
            tags.length;
        document.getElementById("stat-messages").textContent =
            "--";
    }
    catch (err) {
        console.error(err);
    }
}