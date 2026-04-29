import { useState, useMemo } from "react";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageHeader } from "@/components/Page";
import { formatCompactINR } from "@/lib/finance";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const Simulate = () => {
  const { profile, loading } = useFinancialProfile();
  const [salaryGrowth, setSalaryGrowth] = useState(8);
  const [inflation, setInflation] = useState(6);
  const [investReturn, setInvestReturn] = useState(10);
  const [years, setYears] = useState(20);
  const [emergencyMonths, setEmergencyMonths] = useState(0);

  const projection = useMemo(() => {
    if (!profile) return [];
    const data: any[] = [];
    let salary = profile.monthly_salary;
    let expenses = profile.rent + profile.food + profile.utilities + profile.family_support + profile.emi_amount;
    let invest = profile.investments;
    const baseSavings = profile.savings;
    let savings = baseSavings;

    for (let y = 0; y <= years; y++) {
      // emergency hit at year emergencyMonths/12
      const emergencyImpact = emergencyMonths > 0 && y === Math.ceil(emergencyMonths / 12) ? expenses * emergencyMonths : 0;
      data.push({
        year: new Date().getFullYear() + y,
        income: Math.round(salary * 12),
        expenses: Math.round(expenses * 12 + emergencyImpact),
        investments: Math.round(invest),
        savings: Math.round(savings),
      });
      const annualSurplus = (salary - expenses) * 12 - emergencyImpact;
      invest = invest * (1 + investReturn / 100) + Math.max(0, annualSurplus * 0.7);
      savings = Math.max(0, savings + annualSurplus * 0.3);
      salary *= 1 + salaryGrowth / 100;
      expenses *= 1 + inflation / 100;
    }
    return data;
  }, [profile, salaryGrowth, inflation, investReturn, years, emergencyMonths]);

  const finalCorpus = projection.length ? projection[projection.length - 1].investments + projection[projection.length - 1].savings : 0;

  if (loading || !profile) return <div className="h-64 bg-muted rounded-2xl animate-pulse" />;

  return (
    <div className="animate-fade-in">
      <PageHeader title="Simulation Lab" subtitle="Test what-if scenarios for your future." />

      <Tabs defaultValue="growth">
        <TabsList>
          <TabsTrigger value="growth">Career & Inflation</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Shock</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="mt-4 space-y-4">
          <Card className="p-5">
            <div className="grid md:grid-cols-2 gap-6">
              <SliderRow label="Annual salary growth" value={salaryGrowth} setValue={setSalaryGrowth} min={0} max={20} step={0.5} suffix="%" />
              <SliderRow label="General inflation" value={inflation} setValue={setInflation} min={0} max={15} step={0.5} suffix="%" />
              <SliderRow label="Investment return (CAGR)" value={investReturn} setValue={setInvestReturn} min={0} max={20} step={0.5} suffix="%" />
              <SliderRow label="Project for" value={years} setValue={setYears} min={5} max={40} step={1} suffix=" years" />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="emergency" className="mt-4 space-y-4">
          <Card className="p-5">
            <p className="text-sm text-muted-foreground mb-4">Simulate a sudden shock — job loss or medical emergency that wipes out income or adds expenses.</p>
            <SliderRow label="Months of expenses lost (one-time hit next year)" value={emergencyMonths} setValue={setEmergencyMonths} min={0} max={12} step={1} suffix=" months" />
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="p-5 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg">Projected wealth</h3>
            <p className="text-xs text-muted-foreground">Investments + savings combined</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">In {years} years</p>
            <p className="font-display font-bold text-2xl gradient-text">{formatCompactINR(finalCorpus)}</p>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="year" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => formatCompactINR(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={60} />
              <Tooltip formatter={(v: number) => formatCompactINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
              <Legend />
              <Line type="monotone" dataKey="investments" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Investments" />
              <Line type="monotone" dataKey="savings" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Savings" />
              <Line type="monotone" dataKey="expenses" stroke="hsl(var(--destructive))" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Annual expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

const SliderRow = ({ label, value, setValue, min, max, step, suffix }: any) => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <label className="text-sm font-medium">{label}</label>
      <span className="text-sm font-display font-bold text-primary">{value}{suffix}</span>
    </div>
    <Slider value={[value]} onValueChange={v => setValue(v[0])} min={min} max={max} step={step} />
  </div>
);

export default Simulate;
