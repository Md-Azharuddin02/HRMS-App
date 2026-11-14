import { MonitorSmartphone } from "lucide-react";
import { useState, type ReactNode } from "react";
import { currentDevice } from "../utils/device";

/** Blocks phones and tablets before anything else renders (including sign-in). Rules: utils/device.ts. */
export function DesktopOnlyGate({ children }: { children: ReactNode }) {
  const [check] = useState(currentDevice);
  if (check.allowed) return <>{children}</>;
  return (
    <main role="alert" className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-white px-8 text-center">
      <MonitorSmartphone className="size-12 text-brand-600" aria-hidden />
      <h1 className="max-w-sm text-lg font-semibold text-slate-900">This application is accessible only from a laptop or desktop computer.</h1>
      <p className="max-w-sm text-sm text-slate-500">Please sign in from your work computer to record attendance and use WorkforceHub.</p>
    </main>
  );
}
