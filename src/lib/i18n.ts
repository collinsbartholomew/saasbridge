// This is a typed single-locale stub for v1. Full i18n wiring lives in docs/add-i18n.md.

const dict = {
  "auth.error.invalid_code": "Enter the latest verification code and try again.",
  "auth.error.session_required": "You need to sign in to continue.",
  "auth.sign_in.description": "Use the code sent to your email address.",
  "auth.sign_in.title": "Sign in",
  "auth.two_factor.backup_codes": "Backup codes",
  "auth.two_factor.title": "Two-factor authentication",
  "errors.generic": "Something went wrong. Please try again.",
  "errors.not_found": "We could not find that page.",
  "projects.actions.create": "Create project",
  "projects.empty": "No projects yet.",
  "projects.table.title": "Projects",
  "settings.profile.title": "Profile settings",
  "settings.security.sessions": "Active sessions",
  "settings.security.title": "Security settings",
} as const;

export type I18nKey = keyof typeof dict;

export function t(key: I18nKey): string {
  return dict[key];
}
