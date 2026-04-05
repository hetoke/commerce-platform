const API_BASE = import.meta.env.VITE_API_BASE || "";

let csrfTokenCache: string | null = null;

const buildHeaders = (options: RequestInit): HeadersInit => ({
  ...options.headers,
  ...(options.body && !(options.body instanceof FormData)
    ? { "Content-Type": "application/json" }
    : {}),
});

const fetchCsrfToken = async (): Promise<string | null> => {
  const tokenRes = await fetch(`${API_BASE}/api/auth/csrf-token`, {
    credentials: "include",
  });

  if (!tokenRes.ok) {
    return null;
  }

  const data = (await tokenRes.json()) as { csrfToken?: string };
  csrfTokenCache = data.csrfToken ?? null;
  return csrfTokenCache;
};

const ensureCsrfToken = async (): Promise<string> => {
  if (!csrfTokenCache) {
    await fetchCsrfToken();
  }

  return csrfTokenCache ?? "";
};

const refreshAccessToken = async (): Promise<Response> => {
  const csrfToken = await ensureCsrfToken();

  const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRF-Token": csrfToken,
    },
  });

  if (refreshRes.ok) {
    await fetchCsrfToken();
  }

  return refreshRes;
};

export const protectedFetch = async (
  path: string,
  options: RequestInit = {},
): Promise<Response> => {
  const url = `${API_BASE}${path}`;

  await ensureCsrfToken();

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
    const refreshRes = await refreshAccessToken();

    if (!refreshRes.ok) {
      csrfTokenCache = null;
      return response;
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

export function logout(): void {
  ensureCsrfToken()
    .then((csrfToken) =>
      fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
      })
    )
    .finally(() => {
      csrfTokenCache = null;
      window.location.href = "/login";
    });
}
