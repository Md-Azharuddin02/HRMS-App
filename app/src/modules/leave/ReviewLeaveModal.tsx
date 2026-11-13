import { useState } from "react";
import { Field, Textarea } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { DescriptionList } from "../../components/ui/Misc";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { leaveService } from "../../services";
import type { Employee, LeaveRequest } from "../../types";
import { formatDate } from "../../utils/date";
import { fullName } from "../../utils/format";
import { LEAVE_TYPE_LABEL } from "../../utils/labels";

/** Approve or reject a request. Rejections require a note so the employee knows why. */
export function ReviewLeaveModal({ request, employee, decision, onClose }: { request: LeaveRequest; employee?: Employee; decision: "approved" | "rejected"; onClose: () => void }) {
  const { user } = useSession();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string>();
  const { run, pending } = useMutation();
  const approving = decision === "approved";

  const submit = async () => {
    if (!approving && !note.trim()) return setError("Add a reason for the rejection");
    const ok = await run(() => leaveService.review(request.id, decision, user.id, note.trim()), approving ? "Leave approved" : "Leave rejected");
    if (ok) onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={approving ? "Approve leave request" : "Reject leave request"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant={approving ? "primary" : "danger"} loading={pending} onClick={submit}>{approving ? "Approve" : "Reject"}</Button>
        </>
      }
    >
      <DescriptionList
        items={[
          { label: "Employee", value: fullName(employee) },
          { label: "Type", value: `${LEAVE_TYPE_LABEL[request.type]} · ${request.days} day(s)` },
          { label: "Dates", value: `${formatDate(request.startDate)} – ${formatDate(request.endDate)}` },
          { label: "Reason", value: request.reason },
        ]}
      />
      <Field label={approving ? "Note (optional)" : "Reason for rejection"} required={!approving} error={error} className="mt-4">
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => {
            setNote(e.target.value);
            setError(undefined);
          }}
        />
      </Field>
    </Modal>
  );
}
