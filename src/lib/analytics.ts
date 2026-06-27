type AnalyticsScalar = boolean | null | number | string | undefined;
type AnalyticsPayload = Record<string, AnalyticsScalar>;

/**
 * Event names should follow a stable taxonomy such as:
 * - auth.sign_in_requested
 * - auth.sign_in_completed
 * - project.created
 * - settings.two_factor_enabled
 */
export function track(event: string, props?: AnalyticsPayload): void {
  void event;
  void props;
}

export function identify(userId: string, traits?: AnalyticsPayload): void {
  void userId;
  void traits;
}
