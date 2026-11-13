import type { NotificationService } from "./contracts";
import { db, findOr404, respond, save } from "./mock/db";

export const notificationService: NotificationService = {
  async list(recipientId) {
    return respond(db.notifications.filter((n) => n.recipientId === recipientId), 150);
  },

  async markRead(id) {
    findOr404(db.notifications, id, "Notification").read = true;
    save();
    return respond(undefined, 100);
  },

  async markAllRead(recipientId) {
    db.notifications.forEach((n) => {
      if (n.recipientId === recipientId) n.read = true;
    });
    save();
    return respond(undefined, 100);
  },

  async remove(id) {
    db.notifications = db.notifications.filter((n) => n.id !== id);
    save();
    return respond(undefined, 100);
  },
};
