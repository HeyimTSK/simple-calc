import { useState, useMemo } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Trash2, TrendingUp, AlertCircle, Home, Heart, GraduationCap, Wallet, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/Page";
import { formatCompactINR, INFLATION, projectGoal } from "@/lib/finance";
import type { Goal } from "@/lib/finance";

const GOAL_TYPES = [
  { v: "house", l: "Buy a House", icon: Home, infl: INFLATION.lifestyle, ret: 10 },
  { v: "marriage", l: "Marriage", icon: Heart, infl: INFLATION.lifestyle, ret: 10 },
  { v: "education", l: "Child's Education", icon: GraduationCap, infl: INFLATION.education, ret: 11 },
  { v: "retirement", l: "Retirement", icon: Wallet, infl: INFLATION.general, ret: 10 },
  { v: "emergency", l: "Emergency Fund", icon: Sparkles, infl: INFLATION.general, ret: 6 },
  { v: "custom", l: "Custom Goal", icon: Target, infl: INFLATION.general, ret: 10 },
];

const Goals = () => {
  const { user } = useAuth();
  const { goals, loading, refetch } = useGoals();
  const [open, setOpen] = useState(false);
  const nextYear = new Date().getFullYear() + 5;
  const [form, setForm] = useState({
    type: "house", name: "", target_year: nextYear.toString(), current_cost: "",
    inflation_rate: "7", expected_return: "10", current_savings: "0", monthly_contribution: "0",
  });
  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const onTypeChange = (v: string) => {
    const t = GOAL_TYPES.find(x => x.v === v)!;
    setForm(f => ({ ...f, type: v, name: f.name || t.l, inflation_rate: String(t.infl), expected_return: String(t.ret) }));
  };

  const submit = async () => {
    if (!user || !form.name || !form.current_cost) return toast.error("Fill name and amount");
    const { error } = await supabase.from("goals").insert({
      user_id: user.id, type: form.type, name: form.name,
      target_year: Number(form.target_year),
      current_cost: Number(form.current_cost),
      inflation_rate: Number(form.inflation_rate),
      expected_return: Number(form.expected_return),
      current_savings: Number(form.current_savings) || 0,
      monthly_contribution: Number(form.monthly_contribution) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Goal created");
    setOpen(false);
    setForm({ type: "house", name: "", target_year: nextYear.toString(), current_cost: "", inflation_rate: "7", expected_return: "10", current_savings: "0", monthly_contribution: "0" });
    refetch();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); refetch(); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Life Goals" subtitle="Plan ahead. We adjust costs for inflation automatically."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />New goal</Button></DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Create financial goal</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div><Label>Goal type</Label>
                  <Select value={form.type} onValueChange={onTypeChange}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{GOAL_TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Goal name</Label><Input value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. 3BHK in Bangalore" /></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Target year</Label><Input type="number" value={form.target_year} onChange={e => set("target_year", e.target.value)} /></div>
                  <div><Label>Cost today (₹)</Label><Input type="number" value={form.current_cost} onChange={e => set("current_cost", e.target.value)} placeholder="5000000" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Inflation %/yr</Label><Input type="number" step="0.5" value={form.inflation_rate} onChange={e => set("inflation_rate", e.target.value)} /></div>
                  <div><Label>Expected return %/yr</Label><Input type="number" step="0.5" value={form.expected_return} onChange={e => set("expected_return", e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Already saved (₹)</Label><Input type="number" value={form.current_savings} onChange={e => set("current_savings", e.target.value)} /></div>
                  <div><Label>Monthly SIP (₹)</Label><Input type="number" value={form.monthly_contribution} onChange={e => set("monthly_contribution", e.target.value)} /></div>
                </div>
                <Button className="w-full" onClick={submit}>Create goal</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? <div className="h-32 bg-muted rounded-2xl animate-pulse" /> : goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet" description="Add life goals like buying a house, child's education, or retirement. We'll calculate exactly how much to save each month." />
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {goals.map(g => <GoalCard key={g.id} goal={g} onDelete={() => del(g.id)} />)}
        </div>
      )}
    </div>
  );
};

const GoalCard = ({ goal, onDelete }: { goal: Goal; onDelete: () => void }) => {
  const proj = useMemo(() => projectGoal(goal), [goal]);
  const t = GOAL_TYPES.find(x => x.v === goal.type) || GOAL_TYPES[5];
  const Icon = t.icon;
  const progressPct = Math.min(100, (proj.projectedAtCurrentSIP / proj.inflatedTarget) * 100) || 0;

  return (
    <Card className="p-5 relative">
      <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5" /></Button>
      <div className="flex items-center gap-3 mb-4">
        <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
        <div>
          <p className="font-display font-semibold">{goal.name}</p>
          <p className="text-xs text-muted-foreground">In {proj.yearsToGoal} years · {goal.target_year}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Cost today</span><span className="font-medium">{formatCompactINR(goal.current_cost)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Cost in {proj.yearsToGoal}y (inflation)</span><span className="font-medium">{formatCompactINR(proj.inflatedTarget)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Required SIP</span><span className="font-display font-bold text-primary">{formatCompactINR(proj.requiredSIP)}/mo</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Your current SIP</span><span>{formatCompactINR(goal.monthly_contribution)}/mo</span></div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Projected: {formatCompactINR(proj.projectedAtCurrentSIP)}</span>
          <span className="font-medium">{progressPct.toFixed(0)}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <div className="mt-4">
        {proj.onTrack ? (
          <Badge className="bg-success-soft text-success hover:bg-success-soft border-success/20"><TrendingUp className="h-3 w-3 mr-1" />On track</Badge>
        ) : (
          <Badge variant="outline" className="border-warning/40 text-warning-foreground bg-warning-soft"><AlertCircle className="h-3 w-3 mr-1" />Increase SIP by {formatCompactINR(proj.requiredSIP - goal.monthly_contribution)}/mo</Badge>
        )}
      </div>
    </Card>
  );
};

export default Goals;
