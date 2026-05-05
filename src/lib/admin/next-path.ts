/** Prevents basic open redirects when chaining admin auth flows. */
export function resolveAdminContinuation(target: string | null | undefined) {
  if (!target?.startsWith("/")) {
    return "/admin";
  }
  if (target.startsWith("//")) {
    return "/admin";
  }
  return target.startsWith("/admin") ? target : "/admin";
}
