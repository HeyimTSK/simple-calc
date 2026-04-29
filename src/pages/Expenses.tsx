import { useState, useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Wallet, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, StatCard } from "@/components/Page";
import { formatINR, formatCompactINR, EXPENSE_CATEGORIES, guessCategory } from "@/lib/finance";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0ea5a4", "#14b8a6", "#0891b2", "#f59e0b", "#a855f7", "#ec4899", "#84cc16", "#ef4444", "#6366f1", "#06b6d4", "#d946ef", "#22c55e"];

const Expenses = () => {
  const { user } = useAuth();
  const { expenses, loading, refetch } = useExpenses(180);
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ date: today, category: "Other", amount: "", note: "", payment_method: "upi" });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user || !form.amount) return toast.error("Amount required");
    const { error } = await supabase.from("expenses").insert({
      user_id: user.id, date: form.date,
      category: form.category, amount: Number(form.amount),
      note: form.note || null, payment_method: form.payment_method,
    });
    if (error) return toast.error(error.message);
    toast.success("Expense logged");
    setForm({ date: today, category: "Other", amount: "", note: "", payment_method: "upi" });
    setOpen(false); refetch();
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("expenses").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Deleted"); refetch(); }
  };

  // Auto-suggest category as user types note
  const onNoteChange = (note: string) => {
    set("note", note);
    if (note.length > 3 && form.category === "Other") {
      const guessed = guessCategory(note);
      if (guessed !== "Other") set("category", guessed);
    }
  };

  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    const lastMonth = expenses.filter(e => {
      const d = new Date(e.date);
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    });
    const thisTotal = thisMonth.reduce((s, e) => s + e.amount, 0);
    const lastTotal = lastMonth.reduce((s, e) => s + e.amount, 0);
    const change = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

    // Category breakdown for current month
    const byCat: Record<string, number> = {};
    thisMonth.forEach(e => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
    const catData = Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    // Last 6 months trend
    const trend: { label: string; total: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const total = expenses.filter(e => {
        const ed = new Date(e.date);
        return ed.getMonth() === d.getMonth() && ed.getFullYear() === d.getFullYear();
      }).reduce((s, e) => s + e.amount, 0);
      trend.push({ label: d.toLocaleString("en-US", { month: "short" }), total });
    }

    return { thisTotal, lastTotal, change, catData, trend };
  }, [expenses]);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Expenses" subtitle="Log daily expenses to spot trends and leaks."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" />Log expense</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>New expense</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => set("date", e.target.value)} /></div>
                  <div><Label>Amount (₹)</Label><Input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} autoFocus /></div>
                </div>
                <div><Label>Note (auto-categorized)</Label>
                  <Input value={form.note} onChange={e => onNoteChange(e.target.value)} placeholder="e.g. Swiggy dinner, petrol, Amazon" />
                </div>
                <div><Label>Category</Label>
                  <Select value={form.category} onValueChange={v => set("category", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{EXPENSE_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Paid via</Label>
                  <Select value={form.payment_method} onValueChange={v => set("payment_method", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="netbanking">Net banking</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full" onClick={submit}>Save expense</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="This month" value={formatCompactINR(stats.thisTotal)} sub={`${expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth()).length} entries`} />
        <StatCard label="Last month" value={formatCompactINR(stats.lastTotal)} />
        <StatCard
          label="Change"
          value={`${stats.change >= 0 ? "+" : ""}${stats.change.toFixed(1)}%`}
          sub={stats.change > 10 ? "Spending grew sharply" : stats.change > 0 ? "Slight increase" : "Spending reduced — great!"}
          tone={stats.change > 10 ? "destructive" : stats.change > 0 ? "warning" : "success"}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-lg mb-1">Last 6 months</h3>
          <p className="text-xs text-muted-foreground mb-4">Spending trend</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => formatCompactINR(v)} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} width={55} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="total" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-semibold text-lg mb-1">This month by category</h3>
          <p className="text-xs text-muted-foreground mb-4">Where it went</p>
          {stats.catData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No expenses this month yet</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.catData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                      {stats.catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5 text-xs">
                {stats.catData.slice(0, 6).map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground truncate">{d.name}</span>
                    <span className="ml-auto font-medium">{formatCompactINR(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <h3 className="font-display font-semibold text-lg mb-3">Recent entries</h3>
      {loading ? <div className="h-24 bg-muted rounded-2xl animate-pulse" /> : expenses.length === 0 ? (
        <EmptyState icon={Wallet} title="No expenses logged yet" description="Start logging daily spends — even small ones. We'll spot patterns and overspending." />
      ) : (
        <div className="space-y-2">
          {expenses.slice(0, 30).map(e => (
            <Card key={e.id} className="p-3 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                {new Date(e.date).getDate()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{e.note || e.category}</p>
                <p className="text-xs text-muted-foreground">{e.category} · {e.payment_method}</p>
              </div>
              <p className="font-display font-bold text-sm">{formatINR(e.amount)}</p>
              <Button variant="ghost" size="icon" onClick={() => del(e.id)} className="h-7 w-7 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Expenses;
