import { useState, type FormEvent } from "react";

export type Errors<T> = Partial<Record<keyof T, string>>;

/**
 * Minimal controlled-form helper: values, per-field errors and a submit handler
 * that only calls `onValid` when `validate` returns no errors.
 */
export function useForm<T extends object>(initial: T, validate: (v: T) => Errors<T>) {
  const [values, setValues] = useState<T>(initial);
  const [errors, setErrors] = useState<Errors<T>>({});

  const set = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = (onValid: (v: T) => void) => (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.values(found).every((x) => !x)) onValid(values);
  };

  return { values, errors, set, setValues, handleSubmit, reset: () => (setValues(initial), setErrors({})) };
}

export const required = (v: unknown, label: string) => (typeof v === "string" ? v.trim() : v) ? undefined : `${label} is required`;
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE = /^\+?[\d\s-]{8,16}$/;
