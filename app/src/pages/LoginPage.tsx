import { LogIn } from "lucide-react";
import { useState } from "react";
import { Field, Input } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { authService, type AuthSession } from "../services";

/** Sign-in screen shown whenever there is no valid session. */
export default function LoginPage({ onSignedIn }: { onSignedIn: (s: AuthSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Enter your email and password");
      return;
    }
    setPending(true);
    setError(null);
    try {
      onSignedIn(await authService.login(email.trim(), password));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setPending(false);
    }
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-md bg-brand-600 text-sm font-bold text-white" aria-hidden>WH</span>
          <span className="text-lg font-semibold text-slate-900">WorkforceHub</span>
        </div>
        <form onSubmit={submit} noValidate className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Sign in</h1>
            <p className="mt-1 text-sm text-slate-500">Use the work email your administrator registered.</p>
          </div>
          <Field label="Work email" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus />
          </Field>
          <Field label="Password" required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          {error && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" icon={LogIn} loading={pending} className="w-full">Sign in</Button>
          <p className="text-center text-xs text-slate-500">Forgot your password? Ask an administrator to reset it.</p>
        </form>
      </div>
    </main>
  );
}
