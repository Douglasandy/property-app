const PROPERTYPAL_HOST_PATTERN = /(^|\.)propertypal\.com$/i;

export function isPropertyPalUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  try {
    const url = new URL(
      trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
    );
    if (!PROPERTYPAL_HOST_PATTERN.test(url.hostname)) return false;

    const path = url.pathname.replace(/\/+$/, "");
    if (!path || path === "/") return false;

    return true;
  } catch {
    return false;
  }
}

export function normalizePropertyPalUrl(input: string): string {
  const trimmed = input.trim();
  const withProtocol = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  const url = new URL(withProtocol);
  url.hash = "";
  return url.toString().replace(/\/+$/, "");
}
