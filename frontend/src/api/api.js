export const protectedFetch = async (url, options = {}) => {
  const makeRequest = async () => {
    return fetch(url, {
      ...options,
      credentials: "include", // 🔥 REQUIRED for cookies
      headers: {
        ...options.headers,
        ...(options.body && !(options.body instanceof FormData) && {
          "Content-Type": "application/json",
        }),
      },
    });
  };

  let response = await makeRequest();

  // If access token expired → try refresh
  if (response.status === 401) {
    const refreshRes = await fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include", // 🔥 send refresh cookie
    });

    if (!refreshRes.ok) {
      logout();
      return refreshRes;
    }

    // Retry original request after refresh
    response = await makeRequest();
  }

  return response;
};

function logout() {
  fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    window.location.href = "/login";
  });
}
