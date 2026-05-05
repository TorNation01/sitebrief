import { type ComponentProps } from "react";

import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[#0c0c0e] hover:bg-[var(--color-accent-hover)]",
  secondary:
    "border border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25",
  ghost: "text-white/85 hover:bg-white/10 hover:text-white",
};

function cx(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function buttonClassName(variant: ButtonVariant = "primary") {
  return cx(base, variants[variant]);
}

type NativeButtonProps = Omit<ComponentProps<"button">, "className"> & {
  variant?: ButtonVariant;
  className?: string;
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: NativeButtonProps) {
  return (
    <button
      type={type}
      className={cx(buttonClassName(variant), className)}
      {...props}
    />
  );
}

type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return <Link className={cx(buttonClassName(variant), className)} {...props} />;
}
