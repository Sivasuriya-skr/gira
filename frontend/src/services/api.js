import axios from "axios";

// ── Base instance ──────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
    withCredentials: true,          // sends the session cookie automatically
    headers: { "Content-Type": "application/json" },
});

// ── Response interceptor — unwrap { success, message, data } ──────────────────
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const msg =
            err.response?.data?.message ||
            err.message ||
            "Something went wrong. Please try again.";
        return Promise.reject(new Error(msg));
    }
);

// ═══════════════════════════════════════════════════════════
//  AUTH
// ═══════════════════════════════════════════════════════════

export const authAPI = {
    /** POST /api/auth/login  →  { success, data: UserDTO } */
    login: (email, password) =>
        api.post("/auth/login", { email, password }).then((r) => r.data),

    /** POST /api/auth/signup  →  { success, data: UserDTO } */
    signup: (name, email, password, role) =>
        api.post("/auth/signup", { name, email, password, role }).then((r) => r.data),

    /** POST /api/auth/logout */
    logout: () => api.post("/auth/logout").then((r) => r.data),

    /** GET /api/auth/me  →  { success, data: UserDTO } */
    me: () => api.get("/auth/me").then((r) => r.data),
};

// ═══════════════════════════════════════════════════════════
//  TICKETS
// ═══════════════════════════════════════════════════════════

export const ticketAPI = {
    /** GET /api/tickets  — all tickets (manager) */
    getAll: () => api.get("/tickets").then((r) => r.data),

    /** GET /api/tickets?workerId=  — tickets raised by worker */
    getByWorker: (workerId) =>
        api.get("/tickets", { params: { workerId } }).then((r) => r.data),

    /** GET /api/tickets?providerId=  — tickets assigned to provider */
    getByProvider: (providerId) =>
        api.get("/tickets", { params: { providerId } }).then((r) => r.data),

    /** GET /api/tickets/:id */
    getById: (id) => api.get(`/tickets/${id}`).then((r) => r.data),

    /** POST /api/tickets  — create ticket (worker) */
    create: (payload) => api.post("/tickets", payload).then((r) => r.data),

    /** PATCH /api/tickets/:id/assign  — assign provider (manager) */
    assign: (ticketId, providerId) =>
        api.patch(`/tickets/${ticketId}/assign`, { providerId }).then((r) => r.data),

    /** PATCH /api/tickets/:id/status  — update status */
    updateStatus: (ticketId, status) =>
        api.patch(`/tickets/${ticketId}/status`, { status }).then((r) => r.data),

    /** DELETE /api/tickets/:id */
    delete: (ticketId) => api.delete(`/tickets/${ticketId}`).then((r) => r.data),
};

// ═══════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════

export const userAPI = {
    /** GET /api/users/providers  — list all providers */
    getProviders: () => api.get("/users/providers").then((r) => r.data),

    /** GET /api/users  — all users (manager) */
    getAll: () => api.get("/users").then((r) => r.data),
};

export default api;
