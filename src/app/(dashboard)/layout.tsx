import Shell from "@/components/Shell";
import MonthProvider from "@/components/MonthProvider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MonthProvider>
      <Shell>{children}</Shell>
    </MonthProvider>
  );
}
