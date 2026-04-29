import { Outlet, Navigate, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, MessageCircle, Lightbulb, Settings, LogOut, Sparkles,
  Wallet, PiggyBank, Target, FlaskConical, FileText, Users, ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true, group: "main" },
  { to: "/app/expenses", label: "Expenses", icon: Wallet, group: "main" },
  { to: "/app/networth", label: "Net Worth", icon: PiggyBank, group: "main" },
  { to: "/app/goals", label: "Goals", icon: Target, group: "main" },
  { to: "/app/family", label: "Family", icon: Users, group: "main" },
  { to: "/app/simulate", label: "Simulation Lab", icon: FlaskConical, group: "more" },
  { to: "/app/recommendations", label: "Insights", icon: Lightbulb, group: "more" },
  { to: "/app/chat", label: "AI Advisor", icon: MessageCircle, group: "more" },
  { to: "/app/reports", label: "Reports", icon: FileText, group: "more" },
  { to: "/app/profile", label: "Settings", icon: Settings, group: "more" },
];

const bottomNav = [
  { to: "/app", label: "Home", icon: LayoutDashboard, end: true },
  { to: "/app/expenses", label: "Expenses", icon: Wallet },
  { to: "/app/networth", label: "Wealth", icon: PiggyBank },
  { to: "/app/goals", label: "Goals", icon: Target },
  { to: "/app/chat", label: "AI", icon: MessageCircle },
];

const AppLayout = () => {
  const { user, loading, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />;

  return (
    <div className="min-h-screen flex bg-gradient-soft">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-border bg-sidebar/80 backdrop-blur-xl sticky top-0 h-screen">
        <div className="px-6 py-5 flex items-center gap-2 border-b border-sidebar-border">
          <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">Wealth OS</p>
            <p className="text-xs text-muted-foreground">Family Financial Planner</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Manage</p>
          {nav.filter(n => n.group === "main").map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-smooth",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
          <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plan & Learn</p>
          {nav.filter(n => n.group === "more").map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to} to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-smooth",
                isActive
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="h-4 w-4" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="px-2 pb-2">
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold">Wealth OS</span>
          </div>
          <NavLink to="/app/profile" className="text-xs text-muted-foreground">
            <Settings className="h-5 w-5" />
          </NavLink>
        </div>
      </div>

      <main className="flex-1 lg:p-8 p-4 pt-20 lg:pt-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
        <Outlet />
        <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground text-center flex items-center justify-center gap-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          This is AI-generated guidance, not professional financial advice.
        </footer>
      </main>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="grid grid-cols-5 h-16">
          {bottomNav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-smooth",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default AppLayout;
