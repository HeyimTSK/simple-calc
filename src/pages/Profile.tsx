import { useEffect, useState } from "react";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Link } from "react-router-dom";

const investmentOptions = ["SIP / Mutual Funds", "Stocks", "Fixed Deposits", "PPF / EPF", "Gold", "Crypto", "Real Estate"];

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, refetch } = useFinancialProfile();
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        ...profile,
        monthly_salary: String(profile.monthly_salary),
        rent: String(profile.rent),
        food: String(profile.food),
        utilities: String(profile.utilities),
        family_support: String(profile.family_support),
        existing_loans: String(profile.existing_loans),
        emi_amount: String(profile.emi_amount),
        savings: String(profile.savings),
        investments: String(profile.investments),
        emergency_fund_amount: String(profile.emergency_fund_amount),
        dependents: String(profile.dependents),
      });
    }
  }, [profile]);

  if (loading || !form) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  const num = (s: string) => Math.max(0, Number(s) || 0);
  const update = (k: string, v: any) => setForm({ ...form, [k]: v });

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("financial_profiles")
        .update({
          monthly_salary: num(form.monthly_salary),
          rent: num(form.rent),
          food: num(form.food),
          utilities: num(form.utilities),
          family_support: num(form.family_support),
          existing_loans: num(form.existing_loans),
          emi_amount: num(form.emi_amount),
          savings: num(form.savings),
          investments: num(form.investments),
          investment_types: form.investment_types,
          insurance_type: form.insurance_type,
          dependents: Math.max(0, parseInt(form.dependents) || 0),
          has_emergency_fund: form.has_emergency_fund,
          emergency_fund_amount: form.has_emergency_fund ? num(form.emergency_fund_amount) : 0,
          onboarding_completed: true,
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Profile updated");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const numFields = [
    { k: "monthly_salary", l: "Monthly income" },
    { k: "rent", l: "Rent / Home loan" },
    { k: "food", l: "Food & groceries" },
    { k: "utilities", l: "Utilities" },
    { k: "family_support", l: "Family support" },
    { k: "existing_loans", l: "Outstanding loans" },
    { k: "emi_amount", l: "Monthly EMI" },
    { k: "savings", l: "Total savings" },
    { k: "investments", l: "Total investments" },
  ];

  return (
    <div className="space-y-6 max-w-3xl animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold">My profile</h1>
        <p className="text-muted-foreground mt-1">Keep your numbers up to date for accurate advice.</p>
      </div>

      <Card className="p-5 md:p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Account</h2>
        <p className="text-sm text-muted-foreground">Signed in as <span className="font-medium text-foreground">{user?.email}</span></p>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Income & expenses (₹/month)</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {numFields.map((f) => (
            <div key={f.k}>
              <Label htmlFor={f.k}>{f.l}</Label>
              <Input id={f.k} type="number" inputMode="numeric" value={form[f.k]} onChange={(e) => update(f.k, e.target.value)} className="h-11 mt-1.5" />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Investments & emergency fund</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Investment types</Label>
            <div className="grid grid-cols-2 gap-2">
              {investmentOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-smooth">
                  <Checkbox
                    checked={form.investment_types.includes(opt)}
                    onCheckedChange={(c) => {
                      const next = c ? [...form.investment_types, opt] : form.investment_types.filter((x: string) => x !== opt);
                      update("investment_types", next);
                    }}
                  />
                  <span className="text-sm">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-muted/50 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ef-toggle" className="cursor-pointer">I have an emergency fund</Label>
              <Switch id="ef-toggle" checked={form.has_emergency_fund} onCheckedChange={(c) => update("has_emergency_fund", c)} />
            </div>
            {form.has_emergency_fund && (
              <div>
                <Label htmlFor="ef-amount">Emergency fund amount (₹)</Label>
                <Input id="ef-amount" type="number" inputMode="numeric" value={form.emergency_fund_amount} onChange={(e) => update("emergency_fund_amount", e.target.value)} className="h-10 mt-1" />
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <h2 className="font-display font-semibold text-lg mb-4">Insurance & dependents</h2>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Insurance coverage</Label>
            <RadioGroup value={form.insurance_type} onValueChange={(v) => update("insurance_type", v)}>
              {[
                { v: "none", l: "No insurance" },
                { v: "health", l: "Health insurance only" },
                { v: "term", l: "Term insurance only" },
                { v: "both", l: "Both health & term" },
              ].map((opt) => (
                <label key={opt.v} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-smooth">
                  <RadioGroupItem value={opt.v} id={`pi-${opt.v}`} />
                  <span className="text-sm">{opt.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="deps">Number of dependents</Label>
            <Input id="deps" type="number" inputMode="numeric" min="0" value={form.dependents} onChange={(e) => update("dependents", e.target.value)} className="h-11 mt-1.5" />
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-primary hover:opacity-90">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save changes
        </Button>
        <Button asChild variant="outline">
          <Link to="/app">Cancel</Link>
        </Button>
      </div>
    </div>
  );
};

export default Profile;
