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

window.Dashboard = {
    renderHome: renderDashboardHome,
    loadStats: loadDashboardStats
};