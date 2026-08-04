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

async function createTag(name, color, icon) {
    return apiFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({
            name,
            color,
            icon
        })
    });
}

async function fetchTags() {
    return apiFetch("/api/tags");
}

async function updateTag(id, fields) {
    return apiFetch(`/api/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(fields)
    });
}

async function deleteTag(id) {
    return apiFetch(`/api/tags/${id}`, {
        method: "DELETE"
    });
}

window.BlogAPI = {
    fetchPosts,
    createPost,
    updatePost,
    deletePost,
    fetchTags,
    createTag,
    updateTag,
    deleteTag
}