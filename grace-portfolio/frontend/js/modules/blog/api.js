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

async function createTag(name, color, icon, scope = "post") {
    return apiFetch("/api/tags", {
        method: "POST",
        body: JSON.stringify({
            name,
            color,
            icon,
            scope
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

// Review API
async function fetchReviews() {
    return apiFetch("/api/reviews");
}

async function createReview(review) {
    return apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify(review)
    });
}

async function updateReview(id, review) {
    return apiFetch(`/api/reviews/${id}`, {
        method: "PUT",
        body: JSON.stringify(review)
    });
}

async function deleteReview(id) {
    return apiFetch(`/api/reviews/${id}`, { method: "DELETE" });
}

async function fetchReviewTags() {
    return apiFetch("/api/tags?scope=review");
}

window.BlogAPI = {
    fetchPosts, createPost, updatePost, deletePost,
    fetchTags, createTag, updateTag, deleteTag,
    fetchReviews, createReview, updateReview, deleteReview, fetchReviewTags
}