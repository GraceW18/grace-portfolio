async function fetchPosts() {
    return apiFetch("/api/posts");
}

async function createPost(post) {
    return apiFetch("/api/posts", {
        method: "POST",
        body: JSON.stringify(post)
    });
}

async function updatePost(id, post) {
    return apiFetch(`/api/posts/${id}`, {
        method: "PUT",
        body: JSON.stringify(post)
    });
}

async function deletePost(id) {
    return apiFetch(`/api/posts/${id}`, {
        method: "DELETE"
    });
}

async function createTag(name, color) {
    return apiFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({
            name,
            color
        })
    });
}

window.BlogAPI = {
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    createTag
};