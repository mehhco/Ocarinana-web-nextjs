const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

/**
 * Origin that auth emails (confirm signup / reset password) should redirect back to.
 *
 * Supabase silently falls back to the project "Site URL" whenever the requested
 * redirect is not in the Redirect URLs allow list, so a preview deployment or a
 * local dev origin must never be baked into an email. Local development keeps
 * using localhost; everything else is pinned to NEXT_PUBLIC_APP_URL.
 */
export function getAuthRedirectOrigin(currentOrigin: string): string {
  const fallback = currentOrigin.replace(/\/+$/, "");
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!configured) {
    return fallback;
  }

  let current: URL;
  let canonical: URL;
  try {
    current = new URL(currentOrigin);
    canonical = new URL(configured);
  } catch {
    return fallback;
  }

  if (LOCAL_HOSTNAMES.has(current.hostname)) {
    return current.origin;
  }

  return canonical.origin;
}

export function getAuthRedirectUrl(pathname: string, currentOrigin: string): string {
  const origin = getAuthRedirectOrigin(currentOrigin);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${origin}${path}`;
}
