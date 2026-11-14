import { Field, Input } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { required, useForm } from "../hooks/useForm";
import { useMutation } from "../hooks/useMutation";
import { useSession } from "../hooks/useSession";
import { authService } from "../services";

interface Values {
  current: string;
  next: string;
  confirm: string;
}

/** Changing the password signs you out everywhere, including here. */
export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { endSession } = useSession();
  const toast = useToast();
  const { run, pending } = useMutation();
  const form = useForm<Values>({ current: "", next: "", confirm: "" }, (v) => ({
    current: required(v.current, "Current password"),
    next: required(v.next, "New password") ?? (v.next.length < 8 ? "Use at least 8 characters" : undefined),
    confirm: v.confirm !== v.next ? "Passwords don't match" : undefined,
  }));
  const { values: v, errors: e, set } = form;

  const submit = form.handleSubmit(async (x) => {
    if ((await run(() => authService.changePassword(x.current, x.next).then(() => true))) !== true) return;
    toast.success("Password changed. Please sign in with your new password.");
    endSession();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Change password"
      description="You'll be signed out on all devices."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="password-form" loading={pending}>Change password</Button>
        </>
      }
    >
      <form id="password-form" onSubmit={submit} noValidate className="space-y-4">
        <Field label="Current password" required error={e.current}><Input type="password" value={v.current} onChange={(x) => set("current", x.target.value)} autoComplete="current-password" /></Field>
        <Field label="New password" required error={e.next} hint="At least 8 characters."><Input type="password" value={v.next} onChange={(x) => set("next", x.target.value)} autoComplete="new-password" /></Field>
        <Field label="Confirm new password" required error={e.confirm}><Input type="password" value={v.confirm} onChange={(x) => set("confirm", x.target.value)} autoComplete="new-password" /></Field>
      </form>
    </Modal>
  );
}
