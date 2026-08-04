/*
=========================================================
API Helper
=========================================================
*/

const API_BASE = ["localhost", "127.0.0.1"].includes(window.location.hostname)
  ? `http://localhost:3000`
  : "";

async function apiFetch(endpoint, options = {}) {

    const token = localStorage.getItem("jwt");

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API_BASE + endpoint, {
        ...options,
        headers
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || "Request failed.");
    }

    return data;
}