import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "../hooks/useSession";
import type { Permission } from "../types";
import { ROLE_LABELS } from "../utils/permissions";
import { ButtonLink } from "./ui/Button";
import { EmptyState } from "./ui/States";

/** Hides a page from roles without the permission. The API enforces the same rule on every request. */
export function RequirePermission({ permission, children }: { permission: Permission; children: ReactNode }) {
  const { can, role } = useSession();
  if (can(permission)) return <>{children}</>;
  return (
    <EmptyState
      icon={ShieldAlert}
      title="You don't have access to this page"
      message={`The ${ROLE_LABELS[role]} role can't open this section. Switch role from the top bar to preview it.`}
      action={<ButtonLink to="/dashboard" variant="secondary">Back to dashboard</ButtonLink>}
    />
  );
}
