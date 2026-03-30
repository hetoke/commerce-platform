const API_BASE = import.meta.env.VITE_API_BASE || "";

let csrfTokenCache: string | null = null;

const buildHeaders = (options: RequestInit): HeadersInit => ({
  ...options.headers,
  ...(options.body && !(options.body instanceof FormData)
    ? { "Content-Type": "application/json" }
    : {}),
});

export const protectedFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = `${API_BASE}${path}`;

  if (!csrfTokenCache) {
    const tokenRes = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: "include",
    });

    if (tokenRes.ok) {
      const data = (await tokenRes.json()) as { csrfToken?: string };
      csrfTokenCache = data.csrfToken ?? null;
    }
  }

  const makeRequest = async () =>
    fetch(url, {
      ...options,
      credentials: "include",
      headers: {
        ...buildHeaders(options),
        "X-CSRF-Token": csrfTokenCache ?? "",
      },
    });

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

    const tokenRes = await fetch(`${API_BASE}/api/auth/csrf-token`, {
      credentials: "include",
    });

    if (tokenRes.ok) {
      const data = (await tokenRes.json()) as { csrfToken?: string };
      csrfTokenCache = data.csrfToken ?? null;
    }

    response = await makeRequest();
  }

  return response;
};

export const publicFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = `${API_BASE}${path}`;

  return fetch(url, {
    ...options,
    headers: buildHeaders(options),
  });
};

function logout(): void {
  fetch(`${API_BASE}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  }).finally(() => {
    window.location.href = "/login";
  });
}
