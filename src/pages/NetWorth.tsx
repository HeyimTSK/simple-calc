import { useState, useMemo } from "react";
import { useNetWorthData } from "@/hooks/useNetWorthData";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, PiggyBank, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState, StatCard } from "@/components/Page";
import { formatINR, formatCompactINR, netWorth } from "@/lib/finance";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const ASSET_TYPES = [
  { v: "savings", l: "Savings / Bank" },
  { v: "fd", l: "Fixed Deposit" },
  { v: "mutual_funds", l: "Mutual Funds" },
  { v: "stocks", l: "Stocks / Equity" },
  { v: "ppf", l: "PPF / EPF / NPS" },
  { v: "gold", l: "Gold" },
  { v: "real_estate", l: "Real Estate" },
  { v: "crypto", l: "Crypto" },
  { v: "other", l: "Other" },
];

const LIAB_TYPES = [
  { v: "home_loan", l: "Home Loan" },
  { v: "car_loan", l: "Car Loan" },
  { v: "personal_loan", l: "Personal Loan" },
  { v: "education_loan", l: "Education Loan" },
  { v: "credit_card", l: "Credit Card" },
  { v: "other", l: "Other" },
];

const COLORS = ["#0ea5a4", "#14b8a6", "#0891b2", "#f59e0b", "#a855f7", "#ec4899", "#84cc16", "#ef4444", "#6366f1"];

const NetWorthPage = () => {
  const { user } = useAuth();
  const { assets, liabilities, loading, refetch } = useNetWorthData();
  const [aOpen, setAOpen] = useState(false);
  const [lOpen, setLOpen] = useState(false);
  const [aForm, setAForm] = useState({ type: "savings", name: "", current_value: "", owner: "self" });
  const [lForm, setLForm] = useState({ type: "home_loan", name: "", outstanding: "", emi: "", interest_rate: "" });

  const totals = useMemo(() => netWorth(assets, liabilities), [assets, liabilities]);

  const assetChartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    assets.forEach(a => { grouped[a.type] = (grouped[a.type] || 0) + a.current_value; });
    return Object.entries(grouped).map(([type, value]) => ({
      name: ASSET_TYPES.find(t => t.v === type)?.l || type, value,
    }));
  }, [assets]);

  const addAsset = async () => {
    if (!user || !aForm.name) return toast.error("Name required");
    const { error } = await supabase.from("assets").insert({
      user_id: user.id, type: aForm.type, name: aForm.name,
      current_value: Number(aForm.current_value) || 0, owner: aForm.owner,
    });
    if (error) return toast.error(error.message);
    toast.success("Asset added"); setAForm({ type: "savings", name: "", current_value: "", owner: "self" }); setAOpen(false); refetch();
  };

  const addLiab = async () => {
    if (!user || !lForm.name) return toast.error("Name required");
    const { error } = await supabase.from("liabilities").insert({
      user_id: user.id, type: lForm.type, name: lForm.name,
      outstanding: Number(lForm.outstanding) || 0,
      emi: Number(lForm.emi) || 0,
      interest_rate: Number(lForm.interest_rate) || 0,
    });
    if (error) return toast.error(error.message);
    toast.success("Liability added"); setLForm({ type: "home_loan", name: "", outstanding: "", emi: "", interest_rate: "" }); setLOpen(false); refetch();
  };

  const del = async (table: "assets" | "liabilities", id: string) => {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Removed"); refetch(); }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Net Worth" subtitle="Track everything you own and everything you owe." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total assets" value={formatCompactINR(totals.totalAssets)} sub={`${assets.length} items`} tone="success" />
        <StatCard label="Total liabilities" value={formatCompactINR(totals.totalLiab)} sub={`${liabilities.length} items`} tone="destructive" />
        <StatCard label="Net worth" value={formatCompactINR(totals.netWorth)} sub={totals.netWorth >= 0 ? "Positive — keep building" : "Focus on reducing debt"} tone={totals.netWorth >= 0 ? "success" : "destructive"} />
      </div>

      {assetChartData.length > 0 && (
        <Card className="p-5 mb-6">
          <h3 className="font-display font-semibold text-lg mb-4">Asset breakdown</h3>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                    {assetChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {assetChartData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-3 rounded-sm" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                  <span className="ml-auto font-medium">{formatCompactINR(d.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Tabs defaultValue="assets">
        <TabsList>
          <TabsTrigger value="assets"><TrendingUp className="h-4 w-4 mr-1.5" />Assets ({assets.length})</TabsTrigger>
          <TabsTrigger value="liab"><TrendingDown className="h-4 w-4 mr-1.5" />Liabilities ({liabilities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="mt-4">
          <div className="flex justify-end mb-3">
            <Dialog open={aOpen} onOpenChange={setAOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" />Add asset</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add asset</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Type</Label>
                    <Select value={aForm.type} onValueChange={v => setAForm({ ...aForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ASSET_TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Name</Label><Input value={aForm.name} onChange={e => setAForm({ ...aForm, name: e.target.value })} placeholder="e.g. HDFC Top 100 Fund" /></div>
                  <div><Label>Current value (₹)</Label><Input type="number" value={aForm.current_value} onChange={e => setAForm({ ...aForm, current_value: e.target.value })} /></div>
                  <div><Label>Owner</Label>
                    <Select value={aForm.owner} onValueChange={v => setAForm({ ...aForm, owner: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="self">Me</SelectItem>
                        <SelectItem value="spouse">Spouse</SelectItem>
                        <SelectItem value="joint">Joint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={addAsset}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <div className="h-24 bg-muted rounded-2xl animate-pulse" /> : assets.length === 0 ? (
            <EmptyState icon={PiggyBank} title="No assets tracked" description="Add bank balances, FDs, mutual funds, gold, real estate to see your real net worth." />
          ) : (
            <div className="space-y-2">
              {assets.map(a => (
                <Card key={a.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{a.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{ASSET_TYPES.find(t => t.v === a.type)?.l || a.type} · {a.owner}</p>
                  </div>
                  <p className="font-display font-bold">{formatCompactINR(a.current_value)}</p>
                  <Button variant="ghost" size="icon" onClick={() => del("assets", a.id)} className="text-muted-foreground hover:text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liab" className="mt-4">
          <div className="flex justify-end mb-3">
            <Dialog open={lOpen} onOpenChange={setLOpen}>
              <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="h-4 w-4 mr-1" />Add liability</Button></DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add liability</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Type</Label>
                    <Select value={lForm.type} onValueChange={v => setLForm({ ...lForm, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{LIAB_TYPES.map(t => <SelectItem key={t.v} value={t.v}>{t.l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Name</Label><Input value={lForm.name} onChange={e => setLForm({ ...lForm, name: e.target.value })} placeholder="e.g. SBI Home Loan" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Outstanding (₹)</Label><Input type="number" value={lForm.outstanding} onChange={e => setLForm({ ...lForm, outstanding: e.target.value })} /></div>
                    <div><Label>Monthly EMI (₹)</Label><Input type="number" value={lForm.emi} onChange={e => setLForm({ ...lForm, emi: e.target.value })} /></div>
                  </div>
                  <div><Label>Interest rate (%)</Label><Input type="number" step="0.1" value={lForm.interest_rate} onChange={e => setLForm({ ...lForm, interest_rate: e.target.value })} /></div>
                  <Button className="w-full" onClick={addLiab}>Save</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {loading ? <div className="h-24 bg-muted rounded-2xl animate-pulse" /> : liabilities.length === 0 ? (
            <EmptyState icon={TrendingDown} title="No liabilities — great!" description="If you have any loans or credit card debt, add them here for a complete picture." />
          ) : (
            <div className="space-y-2">
              {liabilities.map(l => (
                <Card key={l.id} className="p-4 flex items-center gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{l.name}</p>
                    <p className="text-xs text-muted-foreground">{LIAB_TYPES.find(t => t.v === l.type)?.l} · EMI {formatCompactINR(l.emi)} · {l.interest_rate}%</p>
                  </div>
                  <p className="font-display font-bold text-destructive">{formatCompactINR(l.outstanding)}</p>
                  <Button variant="ghost" size="icon" onClick={() => del("liabilities", l.id)} className="text-muted-foreground hover:text-destructive h-8 w-8"><Trash2 className="h-4 w-4" /></Button>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NetWorthPage;
