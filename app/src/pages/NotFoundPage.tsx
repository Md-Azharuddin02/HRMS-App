import { Compass } from "lucide-react";
import { ButtonLink } from "../components/ui/Button";
import { EmptyState } from "../components/ui/States";

export default function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="Page not found"
      message="The page you're looking for doesn't exist or was moved."
      action={<ButtonLink to="/dashboard" variant="secondary">Go to dashboard</ButtonLink>}
    />
  );
}
