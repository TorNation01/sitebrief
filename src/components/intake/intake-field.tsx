import { forwardRef } from "react";

import type { FieldError } from "react-hook-form";

export function FieldGroup({
  label,
  required,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor?: string;
  hint?: string;
  error?: FieldError;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block">
        <span className="text-base font-medium text-zinc-900">
          {label}
          {required ? (
            <span className="ml-1 text-[var(--color-accent)]" aria-hidden>
              *
            </span>
          ) : null}
        </span>
        {hint ? (
          <span className="mt-1 block text-sm leading-relaxed text-zinc-500">
            {hint}
          </span>
        ) : null}
      </label>
      {children}
      {error?.message ? (
        <p className="text-xs font-medium text-red-600" role="alert">
          {error.message}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-3 text-base text-zinc-900 shadow-sm placeholder:text-zinc-400 outline-none ring-1 ring-transparent transition-[box-shadow,border-color] hover:border-[var(--color-accent)] hover:shadow-md focus-visible:border-transparent focus-visible:ring-[var(--color-accent)]";

export const selectClassName = inputClassName;

export const textareaClassName = `${inputClassName} min-h-[120px] resize-y`;

export const TextInput = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(function TextInput(props, ref) {
  const { className, ...rest } = props;
  return (
    <input
      ref={ref}
      className={`${inputClassName}${className ? ` ${className}` : ""}`}
      {...rest}
    />
  );
});
