/* Plain UI-preference cookie — not sensitive, so unlike the session cookie
   it's written directly client-side (see ThemeToggle.js) rather than via
   an API route. Read server-side in app/layout.js so the very first HTML
   response already has the right theme; no client-side flash/workaround
   needed. */
export const THEME_COOKIE_NAME = "artisans-theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year
