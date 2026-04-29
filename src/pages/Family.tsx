import { useState } from "react";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trash2, Heart, GraduationCap, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, EmptyState } from "@/components/Page";
import type { FamilyMember } from "@/lib/finance";

const blank: Partial<FamilyMember> = {
  relation: "spouse", name: "", age: 0,
  monthly_income: 0, monthly_expenses: 0, investments: 0, insurance_type: "none",
  education_goal: "school", education_target_year: new Date().getFullYear() + 15,
  monthly_medical_expense: 0, has_health_insurance: false, dependency_level: "partial",
};

const Family = () => {
  const { user } = useAuth();
  const { members, loading, refetch } = useFamilyMembers();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<FamilyMember>>(blank);
  const [saving, setSaving] = useState(false);

  const set = (k: keyof FamilyMember, v: any) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!user || !form.name) { toast.error("Please enter a name"); return; }
    setSaving(true);
    const payload: any = {
      user_id: user.id,
      relation: form.relation,
      name: form.name,
      age: Number(form.age) || 0,
    };
    if (form.relation === "spouse") {
      Object.assign(payload, {
        monthly_income: Number(form.monthly_income) || 0,
        monthly_expenses: Number(form.monthly_expenses) || 0,
        investments: Number(form.investments) || 0,
        insurance_type: form.insurance_type || "none",
      });
    } else if (form.relation === "child") {
      Object.assign(payload, {
        education_goal: form.education_goal,
        education_target_year: Number(form.education_target_year) || null,
      });
    } else {
      Object.assign(payload, {
        monthly_medical_expense: Number(form.monthly_medical_expense) || 0,
        has_health_insurance: !!form.has_health_insurance,
        dependency_level: form.dependency_level || "partial",
      });
    }
    const { error } = await supabase.from("family_members").insert(payload);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`${form.name} added to your family`);
    setForm(blank); setOpen(false); refetch();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("family_members").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Removed"); refetch(); }
  };

  const grouped = {
    spouse: members.filter(m => m.relation === "spouse"),
    child: members.filter(m => m.relation === "child"),
    parent: members.filter(m => m.relation === "parent"),
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Your Family"
        subtitle="Add household members so we can plan for everyone."
        action={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-1" /> Add member</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add family member</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Relation</Label>
                  <Select value={form.relation} onValueChange={(v: any) => set("relation", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spouse">Spouse / Partner</SelectItem>
                      <SelectItem value="child">Child</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input value={form.name || ""} onChange={e => set("name", e.target.value)} />
                  </div>
                  <div>
                    <Label>Age</Label>
                    <Input type="number" value={form.age || ""} onChange={e => set("age", e.target.value)} />
                  </div>
                </div>
                {form.relation === "spouse" && (
                  <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                    <div>
                      <Label>Monthly income (₹)</Label>
                      <Input type="number" value={form.monthly_income || ""} onChange={e => set("monthly_income", e.target.value)} />
                    </div>
                    <div>
                      <Label>Monthly expenses (₹)</Label>
                      <Input type="number" value={form.monthly_expenses || ""} onChange={e => set("monthly_expenses", e.target.value)} />
                    </div>
                    <div>
                      <Label>Total investments (₹)</Label>
                      <Input type="number" value={form.investments || ""} onChange={e => set("investments", e.target.value)} />
                    </div>
                    <div>
                      <Label>Insurance</Label>
                      <Select value={form.insurance_type} onValueChange={v => set("insurance_type", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="health">Health only</SelectItem>
                          <SelectItem value="term">Term only</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {form.relation === "child" && (
                  <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                    <div>
                      <Label>Education goal</Label>
                      <Select value={form.education_goal || "school"} onValueChange={v => set("education_goal", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="school">Schooling</SelectItem>
                          <SelectItem value="college">College (India)</SelectItem>
                          <SelectItem value="abroad">Higher studies abroad</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Target year</Label>
                      <Input type="number" value={form.education_target_year || ""} onChange={e => set("education_target_year", e.target.value)} />
                    </div>
                  </div>
                )}
                {form.relation === "parent" && (
                  <div className="space-y-3 rounded-xl bg-muted/40 p-3">
                    <div>
                      <Label>Monthly medical expense (₹)</Label>
                      <Input type="number" value={form.monthly_medical_expense || ""} onChange={e => set("monthly_medical_expense", e.target.value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Has health insurance</Label>
                      <Switch checked={!!form.has_health_insurance} onCheckedChange={c => set("has_health_insurance", c)} />
                    </div>
                    <div>
                      <Label>Dependency level</Label>
                      <Select value={form.dependency_level || "partial"} onValueChange={v => set("dependency_level", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Fully dependent</SelectItem>
                          <SelectItem value="partial">Partially dependent</SelectItem>
                          <SelectItem value="none">Independent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <Button className="w-full" onClick={submit} disabled={saving}>Save member</Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}
        </div>
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No family members yet"
          description="Add your spouse, children, or parents to plan for the whole household."
        />
      ) : (
        <div className="space-y-6">
          {(["spouse", "child", "parent"] as const).map(rel => grouped[rel].length > 0 && (
            <div key={rel}>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                {rel === "spouse" ? "Spouse / Partner" : rel === "child" ? "Children" : "Parents"}
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grouped[rel].map(m => (
                  <Card key={m.id} className="p-5 relative">
                    <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => remove(m.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-xl bg-primary-soft flex items-center justify-center">
                        {rel === "spouse" ? <Heart className="h-5 w-5 text-primary" /> : rel === "child" ? <GraduationCap className="h-5 w-5 text-primary" /> : <Stethoscope className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-display font-semibold">{m.name}</p>
                        <p className="text-xs text-muted-foreground">Age {m.age}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5 text-sm">
                      {rel === "spouse" && (<>
                        <div className="flex justify-between"><span className="text-muted-foreground">Income</span><span>₹{m.monthly_income.toLocaleString("en-IN")}/mo</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Investments</span><span>₹{m.investments.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Insurance</span><Badge variant={m.insurance_type === "none" ? "outline" : "default"}>{m.insurance_type}</Badge></div>
                      </>)}
                      {rel === "child" && (<>
                        <div className="flex justify-between"><span className="text-muted-foreground">Goal</span><span className="capitalize">{m.education_goal}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Target year</span><span>{m.education_target_year}</span></div>
                      </>)}
                      {rel === "parent" && (<>
                        <div className="flex justify-between"><span className="text-muted-foreground">Medical/mo</span><span>₹{m.monthly_medical_expense.toLocaleString("en-IN")}</span></div>
                        <div className="flex justify-between items-center"><span className="text-muted-foreground">Health cover</span><Badge variant={m.has_health_insurance ? "default" : "outline"}>{m.has_health_insurance ? "Yes" : "No"}</Badge></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Dependency</span><span className="capitalize">{m.dependency_level}</span></div>
                      </>)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Family;
