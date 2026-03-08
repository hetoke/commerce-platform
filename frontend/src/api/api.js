// api.js
const API_BASE = import.meta.env.VITE_API_BASE || ""; // set in .env

// Protected fetch
let csrfTokenCache = null;

export const protectedFetch = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;

  // Ensure CSRF token exists
  if (!csrfTokenCache) {
    const tokenRes = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: "include",
    });
    if (tokenRes.ok) {
      const data = await tokenRes.json();
      csrfTokenCache = data.csrfToken;
    }
  }

  const makeRequest = async () =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...options.headers,
        "X-CSRF-Token": csrfTokenCache, // send CSRF token
        ...(options.body && !(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
      },
    });

  let response = await makeRequest();

  // refresh token if 401
  if (response.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      logout();
      return refreshRes;
    }

    // Re-fetch CSRF token
    const tokenRes = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: "include",
    });
    if (tokenRes.ok) {
      const data = await tokenRes.json();
      csrfTokenCache = data.csrfToken;
    }

    response = await makeRequest();
  }

  return response;
};

// Public fetch
export const publicFetch = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(options.body && !(options.body instanceof FormData) && {
        "Content-Type": "application/json",
      }),
    },
  });
};

function logout() {
  fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    window.location.href = "/login";
  });
}