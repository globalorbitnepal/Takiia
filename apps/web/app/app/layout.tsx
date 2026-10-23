import { AppShell } from '../../components/app/AppShell';
import { AuthGate } from '../../components/app/AuthGate';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <AuthGate>{children}</AuthGate>
    </AppShell>
  );
}
