import Shell from "@/components/Shell";
import MonthProvider from "@/components/MonthProvider";
import ConfirmProvider from "@/components/ConfirmProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <ConfirmProvider>
        <Shell>{children}</Shell>
      </ConfirmProvider>
    </MonthProvider>
  );
}
