import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { useGoals } from "@/hooks/useGoals";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/Page";
import { formatINR, formatCompactINR, computeHousehold, healthScore, scoreLabel, netWorth, planRetirement, projectGoal, computeRisks, totalExpenses, savingsRate, emiRatio } from "@/lib/finance";
import { Printer, ShieldAlert } from "lucide-react";

const Reports = () => {
  const { user } = useAuth();
  const { profile, loading } = useFinancialProfile();
  const { members } = useFamilyMembers();
  const { assets, liabilities } = useNetWorthData();
  const { goals } = useGoals();

  if (loading || !profile) return <div className="h-64 bg-muted rounded-2xl animate-pulse" />;

  const household = computeHousehold(profile, members);
  const nw = netWorth(assets, liabilities);
  const ret = planRetirement(profile, household);
  const hs = healthScore(profile);
  const sl = scoreLabel(hs);
  const risks = computeRisks(profile, household);
  const today = new Date().toLocaleDateString("en-IN", { dateStyle: "long" });

  return (
    <div className="animate-fade-in">
      <div className="print:hidden">
        <PageHeader
          title="Financial Report"
          subtitle="A complete snapshot of your household finances. Use Print or Save as PDF."
          action={<Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Print / Save PDF</Button>}
        />
      </div>

      <div id="report" className="space-y-6 print:space-y-4">
        <Card className="p-6 print:shadow-none print:border-0">
          <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
            <div>
              <h1 className="font-display font-bold text-2xl">Family Wealth Report</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Generated</p>
              <p className="text-sm font-medium">{today}</p>
            </div>
          </div>

          <Section title="Finance Score">
            <div className="flex items-center gap-4">
              <div className="text-5xl font-display font-bold gradient-text">{hs}<span className="text-xl text-muted-foreground">/100</span></div>
              <div>
                <p className="font-semibold">{sl.label}</p>
                <p className="text-xs text-muted-foreground">Composite of savings, debt, insurance, investing & emergency cover.</p>
              </div>
            </div>
          </Section>

          <Section title="Household summary">
            <Row k="Members" v={`1 primary + ${members.filter(m => m.relation === "spouse").length} spouse + ${household.totalDependents} dependents`} />
            <Row k="Total monthly income" v={formatINR(household.totalIncome)} />
            <Row k="Total monthly expenses" v={formatINR(household.totalExpenses)} />
            <Row k="Monthly surplus" v={formatINR(household.totalSurplus)} />
            <Row k="Insured / uninsured members" v={`${household.insuredMembers} / ${household.uninsuredMembers}`} />
          </Section>

          <Section title="Net worth">
            <Row k="Total assets" v={formatINR(nw.totalAssets)} />
            <Row k="Total liabilities" v={formatINR(nw.totalLiab)} />
            <Row k="Net worth" v={formatINR(nw.netWorth)} bold />
          </Section>

          <Section title="Cashflow ratios">
            <Row k="Savings rate" v={`${savingsRate(profile).toFixed(1)}%`} />
            <Row k="EMI burden" v={`${emiRatio(profile).toFixed(1)}%`} />
            <Row k="Total monthly expenses (you only)" v={formatINR(totalExpenses(profile))} />
          </Section>

          <Section title="Retirement plan">
            <Row k="Current age → Retirement age" v={`${profile.current_age} → ${profile.retirement_age}`} />
            <Row k="Future monthly expense" v={formatINR(ret.futureMonthlyExpense)} />
            <Row k="Required corpus" v={formatINR(ret.requiredCorpus)} />
            <Row k="Trajectory at current investments" v={formatINR(ret.currentTrajectoryCorpus)} />
            <Row k="Readiness" v={`${ret.readinessScore}%`} />
            <Row k="Suggested additional SIP" v={`${formatINR(ret.monthlyShortfallSIP)}/mo`} bold />
          </Section>

          {goals.length > 0 && (
            <Section title="Life goals">
              {goals.map(g => {
                const p = projectGoal(g);
                return (
                  <div key={g.id} className="border border-border rounded-xl p-3 mb-2">
                    <p className="font-medium">{g.name} <span className="text-muted-foreground text-sm">· {g.target_year}</span></p>
                    <div className="grid grid-cols-2 gap-1 text-xs mt-1">
                      <p>Cost today: <strong>{formatCompactINR(g.current_cost)}</strong></p>
                      <p>Inflated cost: <strong>{formatCompactINR(p.inflatedTarget)}</strong></p>
                      <p>Required SIP: <strong>{formatCompactINR(p.requiredSIP)}/mo</strong></p>
                      <p>Current SIP: <strong>{formatCompactINR(g.monthly_contribution)}/mo</strong></p>
                    </div>
                  </div>
                );
              })}
            </Section>
          )}

          {risks.length > 0 && (
            <Section title="Risks & priorities">
              <ul className="space-y-2 list-disc pl-5">
                {risks.map(r => <li key={r.id} className="text-sm"><strong>{r.title}.</strong> <span className="text-muted-foreground">{r.description}</span></li>)}
              </ul>
            </Section>
          )}

          <div className="mt-6 pt-4 border-t border-border flex items-start gap-2 text-xs text-muted-foreground">
            <ShieldAlert className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>This report is AI-generated guidance based on the data you provided. It is not professional financial advice. Please consult a SEBI-registered financial advisor for major decisions.</p>
          </div>
        </Card>
      </div>

      <style>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, children }: any) => (
  <div className="mb-5 print:mb-3">
    <h2 className="font-display font-semibold text-base border-b border-border pb-1 mb-2">{title}</h2>
    {children}
  </div>
);

const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className={`flex justify-between py-1 text-sm ${bold ? "font-semibold" : ""}`}>
    <span className="text-muted-foreground">{k}</span><span>{v}</span>
  </div>
);

export default Reports;
