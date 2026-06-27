"use client";

import { CheckCircle2, KeyRound, QrCode } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { enableTwoFactorAction, verifyTwoFactorAction } from "@/lib/auth/actions";
import { VerifyTwoFactorInput } from "@/lib/auth/schemas";

type TwoFactorSetupState = {
  backupCodes: string[];
  totpURI: string;
};

function getManualKey(totpURI: string) {
  try {
    return new URL(totpURI).searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}

export function TwoFactorEnableDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [setupState, setSetupState] = useState<TwoFactorSetupState | null>(null);
  const [code, setCode] = useState("");
  const [hasSavedCodes, setHasSavedCodes] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isPending, startTransition] = useTransition();

  const manualKey = useMemo(
    () => (setupState ? getManualKey(setupState.totpURI) : ""),
    [setupState],
  );
  const qrCodeUrl = useMemo(() => {
    if (!setupState) {
      return "";
    }

    return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      setupState.totpURI,
    )}`;
  }, [setupState]);

  const resetState = () => {
    setCode("");
    setHasSavedCodes(false);
    setSetupState(null);
    setShowBackupCodes(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);

    if (!nextOpen) {
      resetState();
    }
  };

  const startSetup = () => {
    startTransition(async () => {
      const result = await enableTwoFactorAction();

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (!result.data) {
        toast.error("Unable to start two-factor setup");
        return;
      }

      setSetupState(result.data);
      toast.success("Authenticator setup ready");
    });
  };

  const verifyCode = () => {
    const parsed = VerifyTwoFactorInput.safeParse({ code });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Enter a valid verification code");
      return;
    }

    startTransition(async () => {
      const result = await verifyTwoFactorAction(parsed.data);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setShowBackupCodes(true);
      toast.success("Two-factor authentication enabled");
      router.refresh();
    });
  };

  const finishSetup = () => {
    setIsOpen(false);
    router.refresh();
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={isOpen}>
      <DialogTrigger asChild>
        <Button>Enable 2FA</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Enable two-factor authentication</DialogTitle>
          <DialogDescription>
            Add an authenticator app as a second factor for your account.
          </DialogDescription>
        </DialogHeader>

        {!setupState ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We will generate a TOTP secret for your authenticator app and backup codes for
              recovery.
            </p>
            <DialogFooter>
              <Button disabled={isPending} onClick={startSetup} type="button">
                {isPending ? "Preparing..." : "Generate QR code"}
              </Button>
            </DialogFooter>
          </div>
        ) : showBackupCodes ? (
          <div className="space-y-5">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertTitle>Backup codes</AlertTitle>
              <AlertDescription>
                These codes are shown once. Save them somewhere secure before closing this dialog.
              </AlertDescription>
            </Alert>
            <div className="grid gap-2 rounded-xl border border-border bg-muted/30 p-4 sm:grid-cols-2">
              {setupState.backupCodes.map((backupCode) => (
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
              <Button disabled={!hasSavedCodes} onClick={finishSetup} type="button">
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                <p className="text-sm font-medium">Scan the QR code</p>
              </div>
              <div className="flex justify-center rounded-xl bg-background p-4">
                {/* Using an image endpoint avoids adding a QR runtime dependency. */}
                <Image
                  alt="Authenticator QR code"
                  className="h-52 w-52 rounded-lg border border-border"
                  height={220}
                  src={qrCodeUrl}
                  unoptimized
                  width={220}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="h-4 w-4" />
                  <p className="text-sm font-medium">Manual setup key</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  If scanning is not available, enter this key into your authenticator app.
                </p>
                <code className="mt-4 block rounded-md border border-border bg-muted/40 px-3 py-3 text-sm break-all">
                  {manualKey}
                </code>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="two-factor-code">6-digit verification code</Label>
                <Input
                  autoComplete="one-time-code"
                  id="two-factor-code"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setCode(event.target.value)}
                  placeholder="123456"
                  value={code}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the code from your authenticator app to finish enabling 2FA.
                </p>
              </div>

              <DialogFooter>
                <Button disabled={isPending} onClick={verifyCode} type="button">
                  {isPending ? "Verifying..." : "Verify and continue"}
                </Button>
              </DialogFooter>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
