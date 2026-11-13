import { cloneElement, isValidElement, useId, type InputHTMLAttributes, type ReactElement, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../../utils/format";

const control =
  "w-full rounded-md border bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500";
const ok = "border-slate-300 focus:border-brand-500 focus:ring-brand-500/20";
const bad = "border-red-400 focus:border-red-500 focus:ring-red-500/20";

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<{ id?: string; "aria-invalid"?: boolean; "aria-describedby"?: string }>;
}

/** Label + control + error/hint, with ids and aria wiring handled for you. */
export function Field({ label, error, hint, required, className, children }: FieldProps) {
  const id = useId();
  const msgId = `${id}-msg`;
  const el = isValidElement(children)
    ? cloneElement(children, { id, "aria-invalid": !!error || undefined, "aria-describedby": error || hint ? msgId : undefined })
    : children;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-slate-700">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {el}
      {error ? (
        <p id={msgId} className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        hint && <p id={msgId} className="mt-1 text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

type WithError = { invalid?: boolean };

export function Input({ className, invalid, ...rest }: InputHTMLAttributes<HTMLInputElement> & WithError) {
  return <input className={cn(control, "h-9", invalid || rest["aria-invalid"] ? bad : ok, className)} {...rest} />;
}

export function Select({ className, invalid, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & WithError) {
  return (
    <select className={cn(control, "h-9 pr-8", invalid || rest["aria-invalid"] ? bad : ok, className)} {...rest}>
      {children}
    </select>
  );
}

export function Textarea({ className, invalid, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement> & WithError) {
  return <textarea className={cn(control, "min-h-20 py-2", invalid || rest["aria-invalid"] ? bad : ok, className)} {...rest} />;
}
