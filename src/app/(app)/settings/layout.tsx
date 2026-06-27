import { SettingsTabs } from "@/components/settings/settings-tabs";
import { requireSession } from "@/lib/auth/require-session";

export default async function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSession();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">Settings</p>
        <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your profile, authentication factors, and session security.
        </p>
      </div>

      <SettingsTabs />

      {children}
    </div>
  );
}
