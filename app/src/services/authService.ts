import type { AuthService, AuthSession } from "./contracts";
import { http, request } from "./http";

async function start(session: Promise<AuthSession>) {
  const s = await session;
  http.setToken(s.accessToken);
  return s;
}

// One refresh at a time per tab: the refresh token rotates, so parallel calls would race each other.
let inFlight: Promise<AuthSession> | null = null;

export const authService: AuthService = {
  login: (email, password) => start(request<AuthSession>("POST", "/auth/login", { email, password })),
  refresh: () => (inFlight ??= start(request<AuthSession>("POST", "/auth/refresh")).finally(() => (inFlight = null))),
  async logout() {
    try {
      await request<void>("POST", "/auth/logout");
    } finally {
      http.setToken(null);
    }
  },
  changePassword: (currentPassword, newPassword) => http.post<void>("/auth/password", { currentPassword, newPassword }),
};

http.setRefreshHandler(() => authService.refresh().then(() => true, () => false));
