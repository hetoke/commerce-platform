// api.js
const API_BASE = import.meta.env.VITE_API_BASE || ""; // set in .env

// Protected fetch
export const protectedFetch = async (path, options = {}) => {
  const url = `${API_BASE}${path}`;
  const makeRequest = async () => {
    return fetch(url, {
      ...options,
      credentials: "include", // send cookies
      headers: {
        ...options.headers,
        ...(options.body && !(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
      },
    });
  };

  let response = await makeRequest();

  if (response.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshRes.ok) {
      logout();
      return refreshRes;
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