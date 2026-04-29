import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export const PageHeader = ({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
    <div>
      <h1 className="text-2xl md:text-3xl font-display font-bold">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const EmptyState = ({
  icon: Icon, title, description, action,
}: { icon: LucideIcon; title: string; description: string; action?: ReactNode }) => (
  <Card className="p-8 md:p-12 text-center border-dashed">
    <div className="inline-flex h-14 w-14 rounded-2xl bg-primary-soft items-center justify-center mb-4">
      <Icon className="h-7 w-7 text-primary" />
    </div>
    <h3 className="font-display font-semibold text-lg">{title}</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{description}</p>
    {action && <div className="mt-5">{action}</div>}
  </Card>
);

export const StatCard = ({
  label, value, sub, tone = "default",
}: { label: string; value: ReactNode; sub?: string; tone?: "default" | "success" | "warning" | "destructive" }) => {
  const toneClass = {
    default: "",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  }[tone];
  return (
    <Card className="stat-card">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl md:text-3xl font-display font-bold mt-1 ${toneClass}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-3">{sub}</p>}
    </Card>
  );
};

export { Button };
