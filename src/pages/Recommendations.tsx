import { useEffect, useState } from "react";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ShieldAlert, TrendingUp, PiggyBank, Receipt, Heart } from "lucide-react";
import { computeRisks } from "@/lib/finance";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Recommendation = {
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  why: string;
  steps: string[];
  monthly_target?: string;
};

const categoryIcons: Record<string, any> = {
  emergency: Heart,
  insurance: ShieldAlert,
  debt: AlertCircle,
  savings: PiggyBank,
  investing: TrendingUp,
  expenses: Receipt,
};

const priorityClasses = {
  high: "border-destructive/30 bg-destructive-soft text-destructive",
  medium: "border-warning/30 bg-warning-soft text-warning-foreground",
  low: "border-success/30 bg-success-soft text-success",
};

const Recommendations = () => {
  const { profile, loading: profileLoading } = useFinancialProfile();
  const [recs, setRecs] = useState<Recommendation[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecs = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("financial-recommendations");
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setRecs(data?.recommendations || []);
    } catch (e: any) {
      setError(e.message || "Couldn't load recommendations");
      toast.error("Couldn't load AI recommendations. Try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.onboarding_completed && !recs) fetchRecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.onboarding_completed]);

  const risks = profile ? computeRisks(profile) : [];

  if (profileLoading) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold">Your action plan</h1>
          <p className="text-muted-foreground mt-1">Personalized steps, prioritized by impact.</p>
        </div>
        <Button onClick={fetchRecs} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Refresh
        </Button>
      </div>

      {/* Risk alerts */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-display font-semibold text-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" /> Risk alerts
          </h2>
          {risks.map((r) => (
            <Card key={r.id} className={cn(
              "p-4 border-2 flex items-start gap-3",
              r.level === "high" ? "border-destructive/30 bg-destructive-soft" : "border-warning/30 bg-warning-soft"
            )}>
              <div className={cn(
                "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
                r.level === "high" ? "bg-destructive/10 text-destructive" : "bg-warning/20 text-warning"
              )}>
                <AlertCircle className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-semibold text-sm md:text-base">{r.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{r.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Smart recommendations
        </h2>

        {loading && !recs && (
          <Card className="p-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-3" />
            <p className="text-muted-foreground">Thinking through your finances...</p>
          </Card>
        )}

        {error && !loading && (
          <Card className="p-6 text-center border-destructive/30 bg-destructive-soft">
            <p className="text-sm text-destructive mb-3">{error}</p>
            <Button onClick={fetchRecs} size="sm" variant="outline">Try again</Button>
          </Card>
        )}

        {recs && recs.length > 0 && (
          <div className="grid gap-4">
            {recs.map((r, i) => {
              const Icon = categoryIcons[r.category] || Sparkles;
              return (
                <Card key={i} className="p-5 md:p-6 hover:shadow-soft transition-smooth animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className="flex items-start gap-4">
                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border", priorityClasses[r.priority])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <h3 className="font-display font-semibold text-base md:text-lg">{r.title}</h3>
                        <Badge variant="outline" className={cn("text-xs", priorityClasses[r.priority])}>
                          {r.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5">{r.why}</p>
                      <ul className="mt-3 space-y-1.5">
                        {r.steps.map((s, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm">
                            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                      {r.monthly_target && (
                        <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-soft text-primary">
                          Monthly target: {r.monthly_target}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center pt-4">
        ⚠️ AI-generated guidance. Not professional financial advice. Consult a SEBI-registered advisor for major decisions.
      </p>
    </div>
  );
};

export default Recommendations;
