import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { formatTime } from "../../../utils/date";

/** Shown after the warning threshold. Any interaction (or the button) dismisses it and resets the timer. */
export function InactivityWarning({ lastActivity, breakMinutes, onStillHere }: { lastActivity: number; breakMinutes: number; onStillHere: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    const original = document.title;
    document.title = "Are you still working? · WorkforceHub"; // visible in the tab strip when the app is in the background
    return () => {
      clearInterval(t);
      document.title = original;
    };
  }, []);

  const breakAt = lastActivity + breakMinutes * 60_000;
  const minutesLeft = Math.max(0, Math.ceil((breakAt - now) / 60_000));

  return (
    <Modal
      open
      onClose={onStillHere}
      title="Are you still working?"
      description={`No activity since ${formatTime(new Date(lastActivity).toISOString())}.`}
      footer={<Button onClick={onStillHere}>I'm still working</Button>}
    >
      <p className="text-sm text-slate-600" aria-live="polite">
        You'll be moved to a break in about <strong>{minutesLeft} minute{minutesLeft === 1 ? "" : "s"}</strong> ({formatTime(new Date(breakAt).toISOString())}) unless you
        use the app. Your attendance session stays open either way.
      </p>
    </Modal>
  );
}
