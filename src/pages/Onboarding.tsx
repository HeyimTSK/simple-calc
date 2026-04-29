import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, Sparkles, Loader2, Wallet, Receipt, PiggyBank, Shield, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/finance";

type FormState = {
  monthly_salary: string;
  rent: string;
  food: string;
  utilities: string;
  family_support: string;
  existing_loans: string;
  emi_amount: string;
  savings: string;
  investments: string;
  investment_types: string[];
  insurance_type: string;
  dependents: string;
  has_emergency_fund: boolean;
  emergency_fund_amount: string;
};

const initial: FormState = {
  monthly_salary: "",
  rent: "",
  food: "",
  utilities: "",
  family_support: "",
  existing_loans: "",
  emi_amount: "",
  savings: "",
  investments: "",
  investment_types: [],
  insurance_type: "none",
  dependents: "0",
  has_emergency_fund: false,
  emergency_fund_amount: "",
};

const investmentOptions = ["SIP / Mutual Funds", "Stocks", "Fixed Deposits", "PPF / EPF", "Gold", "Crypto", "Real Estate"];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initial);
  const [saving, setSaving] = useState(false);

  const totalSteps = 5;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const update = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const next = () => setStep((s) => Math.min(totalSteps - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const num = (s: string) => Math.max(0, Number(s) || 0);
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
      toast.success("All set! Building your dashboard...");
      navigate("/app");
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      icon: Wallet,
      title: "What's your monthly income?",
      desc: "After tax. We'll use this for every calculation.",
      content: (
        <div>
          <Label htmlFor="salary">Monthly take-home (₹)</Label>
          <Input id="salary" type="number" inputMode="numeric" value={form.monthly_salary} onChange={(e) => update("monthly_salary", e.target.value)} placeholder="50000" className="h-12 text-lg mt-2" autoFocus />
          {form.monthly_salary && <p className="text-sm text-muted-foreground mt-2">{formatINR(Number(form.monthly_salary))}</p>}
        </div>
      ),
      canNext: !!form.monthly_salary && Number(form.monthly_salary) > 0,
    },
    {
      icon: Receipt,
      title: "Monthly expenses",
      desc: "Rough numbers are fine — you can update anytime.",
      content: (
        <div className="space-y-4">
          {[
            { k: "rent", label: "Rent / Home loan", placeholder: "15000" },
            { k: "food", label: "Food & groceries", placeholder: "8000" },
            { k: "utilities", label: "Utilities, internet, phone", placeholder: "3000" },
            { k: "family_support", label: "Family support / sending money home", placeholder: "0" },
          ].map((f) => (
            <div key={f.k}>
              <Label htmlFor={f.k}>{f.label} (₹)</Label>
              <Input id={f.k} type="number" inputMode="numeric" value={(form as any)[f.k]} onChange={(e) => update(f.k as any, e.target.value)} placeholder={f.placeholder} className="h-11 mt-1.5" />
            </div>
          ))}
        </div>
      ),
      canNext: true,
    },
    {
      icon: Shield,
      title: "Loans & EMIs",
      desc: "Don't have any? Just leave blank.",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="loans">Total outstanding loans (₹)</Label>
            <Input id="loans" type="number" inputMode="numeric" value={form.existing_loans} onChange={(e) => update("existing_loans", e.target.value)} placeholder="0" className="h-11 mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1">Personal loan, home loan, credit card debt, etc.</p>
          </div>
          <div>
            <Label htmlFor="emi">Total monthly EMI (₹)</Label>
            <Input id="emi" type="number" inputMode="numeric" value={form.emi_amount} onChange={(e) => update("emi_amount", e.target.value)} placeholder="0" className="h-11 mt-1.5" />
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      icon: PiggyBank,
      title: "Savings & investments",
      desc: "Your existing financial cushion.",
      content: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="savings">Total savings in bank (₹)</Label>
            <Input id="savings" type="number" inputMode="numeric" value={form.savings} onChange={(e) => update("savings", e.target.value)} placeholder="50000" className="h-11 mt-1.5" />
          </div>
          <div>
            <Label htmlFor="investments">Total investments (₹)</Label>
            <Input id="investments" type="number" inputMode="numeric" value={form.investments} onChange={(e) => update("investments", e.target.value)} placeholder="0" className="h-11 mt-1.5" />
          </div>
          <div>
            <Label className="mb-2 block">Where do you invest? (optional)</Label>
            <div className="grid grid-cols-2 gap-2">
              {investmentOptions.map((opt) => (
                <label key={opt} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-smooth">
                  <Checkbox
                    checked={form.investment_types.includes(opt)}
                    onCheckedChange={(c) => {
                      const next = c ? [...form.investment_types, opt] : form.investment_types.filter((x) => x !== opt);
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
              <div>
                <Label htmlFor="ef-switch" className="cursor-pointer">I have an emergency fund</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Money set aside for unexpected events</p>
              </div>
              <Switch id="ef-switch" checked={form.has_emergency_fund} onCheckedChange={(c) => update("has_emergency_fund", c)} />
            </div>
            {form.has_emergency_fund && (
              <div className="animate-fade-in">
                <Label htmlFor="ef-amt">Amount (₹)</Label>
                <Input id="ef-amt" type="number" inputMode="numeric" value={form.emergency_fund_amount} onChange={(e) => update("emergency_fund_amount", e.target.value)} placeholder="100000" className="h-10 mt-1" />
              </div>
            )}
          </div>
        </div>
      ),
      canNext: true,
    },
    {
      icon: ShieldCheck,
      title: "Insurance & family",
      desc: "Helps us tailor protection advice.",
      content: (
        <div className="space-y-5">
          <div>
            <Label className="mb-2 block">Do you have insurance?</Label>
            <RadioGroup value={form.insurance_type} onValueChange={(v) => update("insurance_type", v)}>
              {[
                { v: "none", l: "No insurance" },
                { v: "health", l: "Health insurance only" },
                { v: "term", l: "Term insurance only" },
                { v: "both", l: "Both health & term" },
              ].map((opt) => (
                <label key={opt.v} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 cursor-pointer transition-smooth">
                  <RadioGroupItem value={opt.v} id={`ins-${opt.v}`} />
                  <span className="text-sm">{opt.l}</span>
                </label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="deps">Number of dependents</Label>
            <Input id="deps" type="number" inputMode="numeric" min="0" value={form.dependents} onChange={(e) => update("dependents", e.target.value)} className="h-11 mt-1.5" />
            <p className="text-xs text-muted-foreground mt-1">People who depend on your income (kids, parents, etc.)</p>
          </div>
        </div>
      ),
      canNext: true,
    },
  ];

  const cur = steps[step];
  const Icon = cur.icon;

  return (
    <div className="min-h-screen bg-gradient-soft flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl animate-scale-in">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-primary items-center justify-center shadow-soft mb-3">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">Step {step + 1} of {totalSteps}</p>
          <Progress value={((step + 1) / totalSteps) * 100} className="h-1.5 mt-3 max-w-xs mx-auto" />
        </div>

        <Card className="p-6 md:p-8 border-border/60 shadow-soft" key={step}>
          <div className="flex items-start gap-4 mb-6 animate-fade-in">
            <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold">{cur.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{cur.desc}</p>
            </div>
          </div>

          <div className="animate-fade-in">{cur.content}</div>

          <div className="flex items-center justify-between mt-8">
            <Button variant="ghost" onClick={prev} disabled={step === 0 || saving}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
            {step < totalSteps - 1 ? (
              <Button onClick={next} disabled={!cur.canNext} className="bg-gradient-primary hover:opacity-90">
                Continue <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving} className="bg-gradient-primary hover:opacity-90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Finish setup <ArrowRight className="h-4 w-4 ml-1" /></>}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
