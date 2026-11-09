/** Thin HTTP client used by the browser-side model services. */
const ApiClient = {
  baseUrl: window.EDUMARKET_API_URL || "",

  async request(path, options = {}) {
    const token = sessionStorage.getItem("edumarket-access-token");
    const response = await fetch(`${this.baseUrl}/api${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
    const body = await response.json().catch(() => ({}));
    if (response.status === 401) {
      sessionStorage.removeItem("edumarket-access-token");
      localStorage.removeItem("currentUser");
      localStorage.removeItem("edumarket-authenticated");
    }
    if (!response.ok) throw new Error(body.message || body.error || `API error ${response.status}`);
    return body;
  },

  get(path) {
    return this.request(path);
  },

  post(path, value) {
    return this.request(path, { method: "POST", body: JSON.stringify(value) });
  },

  put(path, value) {
    return this.request(path, { method: "PUT", body: JSON.stringify(value) });
  },
};
