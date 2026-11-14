import { MessageCircle } from "lucide-react";
import { useDirectory } from "../../hooks/useDirectory";
import { useSession } from "../../hooks/useSession";
import type { WorkLog } from "../../types";
import { buttonClass } from "../../components/ui/Button";
import { fullName } from "../../utils/format";
import { whatsappShareUrl, workLogMessage } from "../../utils/whatsapp";

/**
 * Opens WhatsApp with the signed-in employee's report filled in; they choose the team group and press send.
 * A real link (not window.open) so it is never caught by popup blockers.
 */
export function ShareOnWhatsApp({ log, compact }: { log: WorkLog; compact?: boolean }) {
  const { user } = useSession();
  const dir = useDirectory();
  const href = whatsappShareUrl(workLogMessage(log, { name: fullName(user), department: dir.department(user.departmentId)?.name }));
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={compact ? "Share this log on WhatsApp" : undefined}
      title="Opens WhatsApp with your report filled in. Pick your team group and send."
      className={compact
        ? "rounded-md p-1.5 text-emerald-700 hover:bg-emerald-50"
        : buttonClass("primary", "md", "bg-[#1f9d55] hover:bg-[#188046]")}
    >
      <MessageCircle className="size-4" aria-hidden />
      {!compact && "Share on WhatsApp"}
    </a>
  );
}
