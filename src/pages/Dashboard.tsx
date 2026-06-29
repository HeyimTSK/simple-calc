import { useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { useGoals } from "@/hooks/useGoals";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import {
  formatINR, formatCompactINR, totalExpenses, monthlySurplus,
  emiRatio, healthScore, scoreLabel, recommendedEmergencyFund,
  emergencyFundProgress, computeRisks, computeHousehold, netWorth, planRetirement, projectGoal,
} from "@/lib/finance";
import {
  TrendingUp, TrendingDown, AlertCircle, Sparkles, ArrowRight, Heart,
  ShieldAlert, ShieldCheck, MessageCircle, Target, Users, PiggyBank
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = {
  rent: "hsl(174 62% 33%)",
  food: "hsl(168 72% 45%)",
  utilities: "hsl(190 70% 50%)",
  family: "hsl(32 95% 60%)",
  emi: "hsl(0 75% 55%)",
  savings: "hsl(152 60% 38%)",
};

const Dashboard = () => {
  const { user } = useAuth();
  const { profile, loading: pLoading } = useFinancialProfile();
  const { members } = useFamilyMembers();
  const { assets, liabilities } = useNetWorthData();
  const { goals } = useGoals();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pLoading && profile && !profile.onboarding_completed) navigate("/onboarding");
  }, [profile, pLoading, navigate]);

  const data = useMemo(() => {
    if (!profile) return null;
    const exp = totalExpenses(profile);
    const sur = monthlySurplus(profile);
    const er = emiRatio(profile);
    const hs = healthScore(profile);
    const efTarget = recommendedEmergencyFund(profile);
    const efProgress = emergencyFundProgress(profile);
    const household = computeHousehold(profile, members);
    const risks = computeRisks(profile, household);
    const sl = scoreLabel(hs);
    const nw = netWorth(assets, liabilities);
    const ret = planRetirement(profile, household);

    const breakdown = [
      { name: "Rent", value: profile.rent, color: COLORS.rent },
      { name: "Food", value: profile.food, color: COLORS.food },
      { name: "Utilities", value: profile.utilities, color: COLORS.utilities },
      { name: "Family", value: profile.family_support, color: COLORS.family },
      { name: "EMI", value: profile.emi_amount, color: COLORS.emi },
      { name: "Saved", value: Math.max(0, sur), color: COLORS.savings },
    ].filter(x => x.value > 0);

    const incomeFlow = [
      { label: "Income", value: household.totalIncome },
      { label: "Expenses", value: household.totalExpenses },
      { label: "Surplus", value: Math.max(0, household.totalSurplus) },
    ];

    return { exp, sur, er, hs, efTarget, efProgress, risks, sl, breakdown, incomeFlow, household, nw, ret };
  }, [profile, members, assets, liabilities]);

  if (pLoading || !profile || !data) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 bg-muted rounded animate-pulse" />
        <div className="grid md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  const greetName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "friend";
  const toneClasses = {
    success: "text-success bg-success-soft",
    warning: "text-warning bg-warning-soft",
    destructive: "text-destructive bg-destructive-soft",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back, {greetName} 👋</p>
          <h1 className="text-2xl md:text-3xl font-display font-bold mt-1">Family Wealth Overview</h1>
          {data.household.totalDependents > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <Users className="h-3 w-3 inline mr-1" />
              Planning for {1 + members.filter(m => m.relation === "spouse").length} earning + {data.household.totalDependents} dependent{data.household.totalDependents > 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm"><Link to="/app/family">Manage family</Link></Button>
          <Button asChild size="sm"><Link to="/app/expenses">Log expense</Link></Button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="stat-card relative overflow-hidden">
          <div className={cn("absolute top-0 right-0 px-2 py-1 text-xs font-semibold rounded-bl-xl", toneClasses[data.sl.tone])}>
            {data.sl.label}
          </div>
          <p className="text-xs text-muted-foreground font-medium">Finance score</p>
          <p className="text-3xl font-display font-bold mt-1 gradient-text">{data.hs}<span className="text-base text-muted-foreground font-normal">/100</span></p>
          <Progress value={data.hs} className="h-1.5 mt-3" />
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground font-medium">Net worth</p>
          <p className={cn("text-3xl font-display font-bold mt-1", data.nw.netWorth >= 0 ? "" : "text-destructive")}>{formatCompactINR(data.nw.netWorth)}</p>
          <p className="text-xs text-muted-foreground mt-3">{assets.length} assets · {liabilities.length} liabilities</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground font-medium">Household income</p>
          <p className="text-3xl font-display font-bold mt-1">{formatCompactINR(data.household.totalIncome)}</p>
          <p className="text-xs text-muted-foreground mt-3">Surplus {formatCompactINR(data.household.totalSurplus)}/mo</p>
        </Card>

        <Card className="stat-card">
          <p className="text-xs text-muted-foreground font-medium">Retirement readiness</p>
          <p className={cn("text-3xl font-display font-bold mt-1", data.ret.readinessScore >= 60 ? "text-success" : data.ret.readinessScore >= 30 ? "text-warning" : "text-destructive")}>
            {data.ret.readinessScore}%
          </p>
          <p className="text-xs text-muted-foreground mt-3">{data.ret.yearsToRetirement}y to retirement</p>
        </Card>
      </div>

      {/* Risks banner */}
      {data.risks.length > 0 && (
        <div className="space-y-3">
          {data.risks.slice(0, 2).map(r => (
            <Card key={r.id} className={cn(
              "p-4 md:p-5 border-2 flex items-start gap-3",
              r.level === "high" ? "border-destructive/30 bg-destructive-soft" : "border-warning/30 bg-warning-soft"
            )}>
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                r.level === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning"
              )}>
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-semibold">{r.title}</h3>
                  <Badge variant="outline" className={cn("text-xs", r.level === "high" ? "border-destructive/40 text-destructive" : "border-warning/40")}>
                    {r.level === "high" ? "High priority" : "Watch out"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
              </div>
            </Card>
          ))}
          {data.risks.length > 2 && (
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/app/recommendations">View all {data.risks.length} alerts <ArrowRight className="h-3.5 w-3.5 ml-1" /></Link>
            </Button>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 md:p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Where your money goes</h3>
          <p className="text-xs text-muted-foreground mb-4">Of your {formatINR(profile.monthly_salary)} monthly income</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {data.breakdown.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {data.breakdown.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="h-3 w-3 rounded-sm" style={{ background: d.color }} />
                <span className="text-muted-foreground">{d.name}</span>
                <span className="ml-auto font-medium">{formatCompactINR(d.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <h3 className="font-display font-semibold text-lg mb-1">Household cashflow</h3>
          <p className="text-xs text-muted-foreground mb-4">Combined income & expenses</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.incomeFlow} barSize={56}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => formatCompactINR(v)} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="hsl(var(--success))" />
                  <Cell fill="hsl(var(--destructive))" />
                  <Cell fill="hsl(var(--primary))" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Goals + Retirement quick view */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary" />Active goals</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Inflation-adjusted targets</p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/app/goals">View all</Link></Button>
          </div>
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No goals set yet.</p>
              <Button asChild size="sm" className="mt-3"><Link to="/app/goals">Add your first goal</Link></Button>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 3).map(g => {
                const p = projectGoal(g);
                const pct = Math.min(100, (p.projectedAtCurrentSIP / p.inflatedTarget) * 100) || 0;
                return (
                  <div key={g.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{g.name}</span>
                      <span className="text-muted-foreground">{formatCompactINR(p.inflatedTarget)} by {g.target_year}</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-5 md:p-6">
          <h3 className="font-display font-semibold text-lg flex items-center gap-2"><PiggyBank className="h-5 w-5 text-primary" />Retirement plan</h3>
          <p className="text-xs text-muted-foreground mt-0.5 mb-4">Based on today's expenses & inflation</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Future monthly need</p>
              <p className="font-display font-bold text-lg">{formatCompactINR(data.ret.futureMonthlyExpense)}</p>
              <p className="text-[10px] text-muted-foreground">at age {profile.retirement_age}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-xs text-muted-foreground">Required corpus</p>
              <p className="font-display font-bold text-lg">{formatCompactINR(data.ret.requiredCorpus)}</p>
              <p className="text-[10px] text-muted-foreground">to last {data.ret.yearsInRetirement}y</p>
            </div>
            <div className="rounded-xl bg-primary-soft p-3 col-span-2">
              <p className="text-xs text-primary/80">Suggested monthly SIP</p>
              <p className="font-display font-bold text-2xl text-primary">{formatCompactINR(data.ret.monthlyShortfallSIP)}</p>
              <p className="text-[10px] text-muted-foreground">in equity mutual funds at ~10% returns</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Emergency fund + insurance */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-lg">Emergency fund</h3>
              <p className="text-xs text-muted-foreground mt-0.5">6-month safety cushion</p>
            </div>
            <Heart className={cn("h-5 w-5", data.efProgress >= 100 ? "text-success" : "text-muted-foreground")} />
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-display font-bold">{formatCompactINR(profile.emergency_fund_amount)}</span>
              <span className="text-sm text-muted-foreground">of {formatCompactINR(data.efTarget)}</span>
            </div>
            <Progress value={data.efProgress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {data.efProgress >= 100 ? "✓ Fully covered" : `${formatCompactINR(data.efTarget - profile.emergency_fund_amount)} to go`}
            </p>
          </div>
        </Card>

        <Card className="p-5 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-display font-semibold text-lg">Family protection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{data.household.insuredMembers} insured · {data.household.uninsuredMembers} uninsured</p>
            </div>
            {data.household.uninsuredMembers === 0 ? <ShieldCheck className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-warning" />}
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Your insurance</span>
              <Badge variant={profile.insurance_type === "both" ? "default" : "outline"} className="capitalize">{profile.insurance_type}</Badge>
            </div>
            {members.filter(m => m.relation === "parent").length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">Parents covered</span>
                <Badge variant={members.filter(m => m.relation === "parent" && m.has_health_insurance).length === members.filter(m => m.relation === "parent").length ? "default" : "outline"}>
                  {members.filter(m => m.relation === "parent" && m.has_health_insurance).length} / {members.filter(m => m.relation === "parent").length}
                </Badge>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* CTA cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground border-0 shadow-elegant">
          <Sparkles className="h-6 w-6 mb-3" />
          <h3 className="font-display font-bold text-xl">Get your action plan</h3>
          <p className="text-primary-foreground/80 text-sm mt-1 mb-4">AI-prioritized steps for your household.</p>
          <Button asChild variant="secondary" size="sm">
            <Link to="/app/recommendations">View insights <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </Card>
        <Card className="p-6 border-border/60">
          <MessageCircle className="h-6 w-6 mb-3 text-primary" />
          <h3 className="font-display font-bold text-xl">Ask me anything</h3>
          <p className="text-muted-foreground text-sm mt-1 mb-4">"Can I afford this loan?", "What if I lose my job?" — full household context.</p>
          <Button asChild size="sm">
            <Link to="/app/chat">Open AI Advisor <ArrowRight className="h-4 w-4 ml-1" /></Link>
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
