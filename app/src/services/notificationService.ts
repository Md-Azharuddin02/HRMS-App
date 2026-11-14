import type { NotificationService } from "./contracts";
import { http } from "./http";
import type { AppNotification } from "../types";

export const notificationService: NotificationService = {
  list: () => http.get<AppNotification[]>("/notifications"),
  markRead: (id) => http.post<void>(`/notifications/${encodeURIComponent(id)}/read`),
  markAllRead: () => http.post<void>("/notifications/read-all"),
  remove: (id) => http.delete(`/notifications/${encodeURIComponent(id)}`),
};
