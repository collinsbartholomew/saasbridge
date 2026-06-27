import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy",
  description: "Privacy defaults and third-party services used by the SaaSBridge starter.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background" id="main">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-10 sm:px-8 lg:px-12">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Privacy</p>
          <h1 className="text-3xl font-semibold tracking-tight">
            Privacy defaults for this starter
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            This page is written as a clear baseline for a production-shaped starter. Adjust the
            wording to match your real product, support address, and any services you add later.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What data is collected</CardTitle>
            <CardDescription>
              The starter stores the minimum account and app data needed to operate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              By default, the app stores account identifiers, session records, verification data,
              security events, and user-created project data. It may also store trusted-device and
              audit-log records when security features are used.
            </p>
            <p>
              The app does not ship with marketing trackers, ad pixels, or behavioral profiling in
              v1. If you add more data collection later, update this page before shipping.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cookies</CardTitle>
            <CardDescription>
              Authentication sessions are the only cookies enabled by default.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              The starter uses auth-session cookies so signed-in users can access protected routes.
              These cookies are required for the app to function and are not used for ad targeting.
            </p>
            <p>
              If you later add analytics, experimentation, or embedded third-party tools, review the
              cookie behavior and update this section accordingly.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Third-party services</CardTitle>
            <CardDescription>
              Only a small set of external services are expected in v1.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Neon provides the hosted PostgreSQL database used for application data. Resend is used
              for transactional email in production, including sign-in verification messages.
            </p>
            <p>
              Your hosting provider will also process standard request logs needed to operate the
              deployment. If you add more processors later, document them here with purpose and data
              category.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User rights</CardTitle>
            <CardDescription>
              Access, deletion, and export requests should be handled by the app owner.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Users should be able to request access to their account data, ask for deletion of
              their data, and request an export of the information associated with their account.
            </p>
            <p>
              This starter does not automate those workflows in v1. Handle them through your support
              process until you build a self-serve account data flow.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
            <CardDescription>
              Publish a real support address before taking the app live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
            <p>
              Route privacy, deletion, and export requests to the support contact you publish in
              your product footer, onboarding emails, or legal pages. Replace this starter copy with
              your real mailbox or support form before launch.
            </p>
            <p className="font-medium text-foreground">Analytics is disabled in v1.</p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
