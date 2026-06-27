"use client";

import {
  AlertTriangle,
  KeySquare,
  LaptopMinimal,
  ShieldCheck,
  ShieldOff,
  Smartphone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { TwoFactorEnableDialog } from "@/app/(app)/settings/security/two-factor-enable-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  disableTwoFactorAction,
  regenerateBackupCodesAction,
  revokeSessionAction,
} from "@/lib/auth/actions";

type SecuritySession = {
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  token: string;
  updatedAt: string;
  userAgent: string | null;
};

type SecurityPanelProps = {
  currentSessionToken?: string;
  sessions: SecuritySession[];
  twoFactorEnabled: boolean;
};

const sessionFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatSessionDate(value: string) {
  return sessionFormatter.format(new Date(value));
}

export function SecurityPanel({
  currentSessionToken,
  sessions,
  twoFactorEnabled,
}: SecurityPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [hasSavedCodes, setHasSavedCodes] = useState(false);

  const revokeSession = (token: string) => {
    startTransition(async () => {
      const result = await revokeSessionAction({ token });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(token === currentSessionToken ? "Signed out" : "Session revoked");

      if (token === currentSessionToken) {
        router.push("/sign-in");
        router.refresh();
        return;
      }

      router.refresh();
    });
  };

  const disableTwoFactor = () => {
    startTransition(async () => {
      const result = await disableTwoFactorAction();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Two-factor authentication disabled");
      router.refresh();
    });
  };

  const regenerateBackupCodes = () => {
    startTransition(async () => {
      const result = await regenerateBackupCodesAction();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (!result.data) {
        toast.error("Unable to regenerate backup codes");
        return;
      }

      setBackupCodes(result.data.backupCodes);
      setHasSavedCodes(false);
      toast.success("Backup codes regenerated");
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {twoFactorEnabled ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldOff className="h-5 w-5" />
            )}
            Two-factor authentication
          </CardTitle>
          <CardDescription>
            Protect your account with a time-based authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant={twoFactorEnabled ? "default" : "secondary"}>
              {twoFactorEnabled ? "Enabled" : "Disabled"}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {twoFactorEnabled
                ? "A second factor is required when signing in."
                : "Enable 2FA to require an authenticator code after email OTP."}
            </p>
          </div>
          {twoFactorEnabled ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline">Disable 2FA</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Disable two-factor authentication?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Your account will go back to email OTP only. Backup codes will no longer work.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction disabled={isPending} onClick={disableTwoFactor}>
                    {isPending ? "Disabling..." : "Disable 2FA"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <TwoFactorEnableDialog />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeySquare className="h-5 w-5" />
            Backup codes
          </CardTitle>
          <CardDescription>
            Generate one-time recovery codes in case you lose access to your authenticator app.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Regenerating backup codes invalidates the previous set immediately.
          </p>
          <Button
            disabled={!twoFactorEnabled || isPending}
            onClick={regenerateBackupCodes}
            variant="outline"
          >
            {isPending ? "Generating..." : "Regenerate backup codes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Trusted devices
          </CardTitle>
          <CardDescription>
            Devices that have previously skipped an extra prompt during sign-in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unavailable in current Better Auth API</AlertTitle>
            <AlertDescription>
              This installed Better Auth version supports trusted-device cookies, but it does not
              expose a list or revoke API for them yet.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LaptopMinimal className="h-5 w-5" />
            Active sessions
          </CardTitle>
          <CardDescription>
            Revoke sessions you no longer recognize or want to keep signed in.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length ? (
            sessions.map((session) => {
              const isCurrent = session.token === currentSessionToken;

              return (
                <div
                  className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-start sm:justify-between"
                  key={session.token}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{session.userAgent || "Unknown device"}</p>
                      {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Last active {formatSessionDate(session.updatedAt)}</p>
                      <p>Created {formatSessionDate(session.createdAt)}</p>
                      <p>Expires {formatSessionDate(session.expiresAt)}</p>
                      <p>IP {session.ipAddress ?? "Unavailable"}</p>
                    </div>
                  </div>

                  <Button
                    disabled={isPending}
                    onClick={() => revokeSession(session.token)}
                    variant={isCurrent ? "destructive" : "outline"}
                  >
                    {isCurrent ? "Sign out" : "Revoke"}
                  </Button>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-muted-foreground">No active sessions found.</p>
          )}
        </CardContent>
      </Card>

      <Dialog
        onOpenChange={(open) => (!open ? setBackupCodes(null) : null)}
        open={Boolean(backupCodes)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New backup codes</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
            {backupCodes?.map((backupCode) => (
              <code
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                key={backupCode}
              >
                {backupCode}
              </code>
            ))}
          </div>
          <label className="flex items-start gap-3 text-sm">
            <input
              checked={hasSavedCodes}
              className="mt-1"
              onChange={(event) => setHasSavedCodes(event.target.checked)}
              type="checkbox"
            />
            <span>I have saved these backup codes in a secure place.</span>
          </label>
          <DialogFooter>
            <Button disabled={!hasSavedCodes} onClick={() => setBackupCodes(null)} type="button">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
