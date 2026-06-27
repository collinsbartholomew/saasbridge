import { AppSidebar } from "@/components/app/app-sidebar";
import { requireSession } from "@/lib/auth/require-session";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return (
    <div className="min-h-screen bg-muted/20 lg:flex">
      <AppSidebar userEmail={session.user.email} userName={session.user.name} />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8" id="main">
          {children}
        </main>
      </div>
    </div>
  );
}
