import type { WorkLog } from "../types";
import { formatDate, formatHours } from "./date";

// WhatsApp has no link that posts straight into a given group: wa.me opens WhatsApp (app or web) with the
// text filled in and the user picks the group. Automatic group posting would need the WhatsApp Business
// Platform on a server, which is out of scope here.
const MAX_CHARS = 3500; // keeps the link well under browser and WhatsApp limits

export interface ShareContext {
  name: string;
  department?: string;
}

/** Plain-text daily report using WhatsApp's *bold* formatting. */
export function workLogMessage(log: Pick<WorkLog, "date" | "hours" | "completed" | "ongoing" | "blockers" | "remarks">, who: ShareContext): string {
  const list = (items: string[]) => items.map((x) => `• ${x}`).join("\n");
  const parts = [
    `*Daily Work Report · ${formatDate(log.date)}*`,
    `${who.name}${who.department ? ` · ${who.department}` : ""}`,
    `Hours: ${formatHours(log.hours)}`,
    log.completed.length ? `*Completed*\n${list(log.completed)}` : "",
    log.ongoing.length ? `*Ongoing*\n${list(log.ongoing)}` : "",
    `*Blockers*\n${log.blockers || "None"}`,
    log.remarks ? `*Remarks*\n${log.remarks}` : "",
  ].filter(Boolean);
  const text = parts.join("\n\n");
  return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS - 1)}…` : text;
}

export const whatsappShareUrl = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
