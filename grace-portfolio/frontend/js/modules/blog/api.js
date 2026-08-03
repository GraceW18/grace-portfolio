async function fetchPosts() {
    return apiFetch("/api/posts");
}

async function createPost(post) {
    return apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(post)
    });
}

window.BlogAPI = {
    fetchPosts,
    createPost
};