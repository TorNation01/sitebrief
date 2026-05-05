import { type ReactNode } from "react";

type CardTone = "light" | "dark";

const toneStyles: Record<CardTone, { shell: string; title: string; desc: string }> = {
  light: {
    shell:
      "border-black/10 bg-[var(--color-card)] shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)]",
    title: "text-[var(--color-card-foreground)]",
    desc: "text-[var(--color-card-muted)]",
  },
  dark: {
    shell:
      "border-white/15 bg-white/[0.055] backdrop-blur-sm shadow-none",
    title: "text-white",
    desc: "text-white/65",
  },
};

type CardProps = {
  children?: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  tone?: CardTone;
};

export function Card({
  children,
  className = "",
  title,
  description,
  tone = "light",
}: CardProps) {
  const t = toneStyles[tone];

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${t.shell} ${className}`}>
      {(title || description) && (
        <header className="mb-6">
          {title && (
            <h2 className={`text-xl font-semibold tracking-tight ${t.title}`}>
              {title}
            </h2>
          )}
          {description && (
            <p className={`mt-2 text-sm leading-relaxed ${t.desc}`}>
              {description}
            </p>
          )}
        </header>
      )}
      {children}
    </div>
  );
}
