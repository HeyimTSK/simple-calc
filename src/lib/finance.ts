// Finance calculations & helpers — pure, testable utilities.

export type FinancialProfile = {
  monthly_salary: number;
  rent: number;
  food: number;
  utilities: number;
  family_support: number;
  existing_loans: number;
  emi_amount: number;
  savings: number;
  investments: number;
  investment_types: string[];
  insurance_type: string; // 'health' | 'term' | 'both' | 'none'
  dependents: number;
  has_emergency_fund: boolean;
  emergency_fund_amount: number;
  current_age?: number;
  retirement_age?: number;
  life_expectancy?: number;
  risk_profile?: string;
};

export type FamilyMember = {
  id: string;
  relation: "spouse" | "child" | "parent";
  name: string;
  age: number;
  monthly_income: number;
  monthly_expenses: number;
  investments: number;
  insurance_type: string;
  education_goal?: string | null;
  education_target_year?: number | null;
  monthly_medical_expense: number;
  has_health_insurance: boolean;
  dependency_level?: string | null;
};

export type Asset = {
  id: string;
  type: string;
  name: string;
  current_value: number;
  owner: string;
};

export type Liability = {
  id: string;
  type: string;
  name: string;
  outstanding: number;
  emi: number;
  interest_rate: number;
};

export type Goal = {
  id: string;
  type: string;
  name: string;
  target_year: number;
  current_cost: number;
  inflation_rate: number;
  expected_return: number;
  current_savings: number;
  monthly_contribution: number;
  linked_member_id?: string | null;
};

// ---------- Inflation rates (India, conservative) ----------
export const INFLATION = {
  general: 6,
  medical: 11,
  education: 9,
  lifestyle: 7,
} as const;

// ---------- Formatting ----------
export const formatINR = (n: number) => {
  if (!isFinite(n)) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
};

export const formatCompactINR = (n: number) => {
  if (!isFinite(n)) return "₹0";
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a >= 1e7) return `${sign}₹${(a / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `${sign}₹${(a / 1e5).toFixed(2)} L`;
  if (a >= 1e3) return `${sign}₹${(a / 1e3).toFixed(1)}K`;
  return `${sign}₹${Math.round(a)}`;
};

// ---------- Core ratios ----------
export const totalExpenses = (p: FinancialProfile) =>
  p.rent + p.food + p.utilities + p.family_support + p.emi_amount;

export const monthlySurplus = (p: FinancialProfile) =>
  p.monthly_salary - totalExpenses(p);

export const savingsRate = (p: FinancialProfile) => {
  if (p.monthly_salary <= 0) return 0;
  return Math.max(0, (monthlySurplus(p) / p.monthly_salary) * 100);
};

export const emiRatio = (p: FinancialProfile) => {
  if (p.monthly_salary <= 0) return 0;
  return (p.emi_amount / p.monthly_salary) * 100;
};

export const recommendedEmergencyFund = (p: FinancialProfile) =>
  totalExpenses(p) * 6;

export const emergencyFundProgress = (p: FinancialProfile) => {
  const target = recommendedEmergencyFund(p);
  if (target <= 0) return 0;
  return Math.min(100, (p.emergency_fund_amount / target) * 100);
};

// ---------- Household aggregates ----------
export type Household = {
  totalIncome: number;
  totalExpenses: number;
  totalSurplus: number;
  totalInvestments: number;
  totalDependents: number;
  totalMedical: number;
  insuredMembers: number;
  uninsuredMembers: number;
  members: FamilyMember[];
};

export const computeHousehold = (
  p: FinancialProfile,
  members: FamilyMember[]
): Household => {
  let income = p.monthly_salary;
  let expenses = totalExpenses(p);
  let investments = p.investments;
  let medical = 0;
  let dependents = 0;
  let insured = p.insurance_type !== "none" ? 1 : 0;
  let uninsured = p.insurance_type === "none" ? 1 : 0;

  for (const m of members) {
    if (m.relation === "spouse") {
      income += m.monthly_income;
      expenses += m.monthly_expenses;
      investments += m.investments;
      if (m.insurance_type !== "none") insured++;
      else uninsured++;
    } else {
      dependents++;
      medical += m.monthly_medical_expense || 0;
      if (m.has_health_insurance) insured++;
      else uninsured++;
    }
  }
  expenses += medical;

  return {
    totalIncome: income,
    totalExpenses: expenses,
    totalSurplus: income - expenses,
    totalInvestments: investments,
    totalDependents: dependents,
    totalMedical: medical,
    insuredMembers: insured,
    uninsuredMembers: uninsured,
    members,
  };
};

// ---------- Net worth ----------
export const netWorth = (assets: Asset[], liabilities: Liability[]) => {
  const totalAssets = assets.reduce((s, a) => s + (a.current_value || 0), 0);
  const totalLiab = liabilities.reduce((s, l) => s + (l.outstanding || 0), 0);
  return { totalAssets, totalLiab, netWorth: totalAssets - totalLiab };
};

// ---------- Inflation helpers ----------
/** Future value of a present amount at annual inflation rate, after `years` years. */
export const inflateFV = (present: number, ratePct: number, years: number) =>
  present * Math.pow(1 + ratePct / 100, Math.max(0, years));

/** Real return = nominal return discounted by inflation. */
export const realReturn = (nominalPct: number, inflationPct: number) =>
  ((1 + nominalPct / 100) / (1 + inflationPct / 100) - 1) * 100;

// ---------- Goal SIP calculator ----------
/**
 * Required monthly SIP to reach a target amount in `years` years
 * given expected annual return. Future value of an annuity inverted.
 */
export const requiredMonthlySIP = (
  targetAmount: number,
  years: number,
  annualReturnPct: number,
  currentSavings = 0
) => {
  const months = Math.max(1, years * 12);
  const r = annualReturnPct / 100 / 12;
  const fvCurrent = currentSavings * Math.pow(1 + r, months);
  const need = Math.max(0, targetAmount - fvCurrent);
  if (r === 0) return need / months;
  return (need * r) / (Math.pow(1 + r, months) - 1);
};

export type GoalProjection = {
  yearsToGoal: number;
  inflatedTarget: number;
  requiredSIP: number;
  projectedAtCurrentSIP: number;
  onTrack: boolean;
  shortfall: number;
};

export const projectGoal = (g: Goal): GoalProjection => {
  const currentYear = new Date().getFullYear();
  const years = Math.max(0, g.target_year - currentYear);
  const inflatedTarget = inflateFV(g.current_cost, g.inflation_rate, years);
  const requiredSIP = requiredMonthlySIP(
    inflatedTarget,
    Math.max(1, years),
    g.expected_return,
    g.current_savings
  );
  // FV of current SIP plan
  const months = Math.max(1, years * 12);
  const r = g.expected_return / 100 / 12;
  const fvSavings = g.current_savings * Math.pow(1 + r, months);
  const fvSIP =
    r === 0
      ? g.monthly_contribution * months
      : g.monthly_contribution * ((Math.pow(1 + r, months) - 1) / r);
  const projected = fvSavings + fvSIP;
  return {
    yearsToGoal: years,
    inflatedTarget,
    requiredSIP,
    projectedAtCurrentSIP: projected,
    onTrack: projected >= inflatedTarget,
    shortfall: Math.max(0, inflatedTarget - projected),
  };
};

// ---------- Retirement engine ----------
export type RetirementPlan = {
  yearsToRetirement: number;
  yearsInRetirement: number;
  futureMonthlyExpense: number;
  requiredCorpus: number;
  currentTrajectoryCorpus: number;
  readinessScore: number; // 0-100
  monthlyShortfallSIP: number;
};

export const planRetirement = (
  p: FinancialProfile,
  household: Household
): RetirementPlan => {
  const age = p.current_age ?? 30;
  const retire = p.retirement_age ?? 60;
  const life = p.life_expectancy ?? 85;
  const yearsToRet = Math.max(0, retire - age);
  const yearsInRet = Math.max(1, life - retire);

  // Future monthly expense at retirement (today's expenses inflated)
  const todayMonthlyExp = household.totalExpenses;
  const futMonthlyExp = inflateFV(todayMonthlyExp, INFLATION.general, yearsToRet);

  // Required corpus: PV of annuity in retirement using real return
  // Assume nominal return 9%, inflation 6% during retirement -> real ~2.83%
  const realR = realReturn(9, INFLATION.general) / 100; // annual decimal
  const yearlyExp = futMonthlyExp * 12;
  const corpus =
    realR <= 0
      ? yearlyExp * yearsInRet
      : (yearlyExp * (1 - Math.pow(1 + realR, -yearsInRet))) / realR;

  // Project current investments forward at 10%
  const currentTraj = inflateFV(household.totalInvestments, 10, yearsToRet);
  const readiness =
    corpus <= 0 ? 100 : Math.min(100, Math.round((currentTraj / corpus) * 100));
  const need = Math.max(0, corpus - currentTraj);
  const sip = requiredMonthlySIP(need, Math.max(1, yearsToRet), 10, 0);

  return {
    yearsToRetirement: yearsToRet,
    yearsInRetirement: yearsInRet,
    futureMonthlyExpense: futMonthlyExp,
    requiredCorpus: corpus,
    currentTrajectoryCorpus: currentTraj,
    readinessScore: readiness,
    monthlyShortfallSIP: sip,
  };
};

// ---------- Health score ----------
export const healthScore = (p: FinancialProfile): number => {
  let score = 0;
  const sr = savingsRate(p);
  score += Math.min(30, (sr / 30) * 30);

  const er = emiRatio(p);
  if (er === 0) score += 20;
  else if (er < 20) score += 18;
  else if (er < 30) score += 14;
  else if (er < 40) score += 8;
  else if (er < 50) score += 3;

  const efp = emergencyFundProgress(p);
  score += (efp / 100) * 20;

  if (p.insurance_type === "both") score += 15;
  else if (p.insurance_type === "health") score += 10;
  else if (p.insurance_type === "term") score += 7;

  if (p.investments > 0 && p.monthly_salary > 0) {
    const invRatio = p.investments / Math.max(1, p.monthly_salary * 12);
    score += Math.min(15, invRatio * 30);
  }
  return Math.round(Math.max(0, Math.min(100, score)));
};

export const scoreLabel = (s: number) => {
  if (s >= 80) return { label: "Wealth Builder", tone: "success" as const };
  if (s >= 60) return { label: "Stable", tone: "success" as const };
  if (s >= 40) return { label: "Average", tone: "warning" as const };
  if (s >= 20) return { label: "Vulnerable", tone: "warning" as const };
  return { label: "At Risk", tone: "destructive" as const };
};

export type Risk = {
  id: string;
  level: "high" | "medium" | "low";
  title: string;
  description: string;
};

export const computeRisks = (
  p: FinancialProfile,
  household?: Household
): Risk[] => {
  const risks: Risk[] = [];
  const er = emiRatio(p);

  if (!p.has_emergency_fund || p.emergency_fund_amount < totalExpenses(p) * 3) {
    risks.push({
      id: "emergency",
      level: "high",
      title: "No safety net for emergencies",
      description:
        "You don't have enough saved to cover 3+ months of expenses. A medical bill or job loss could put you in debt.",
    });
  }

  if (er > 40) {
    risks.push({
      id: "emi",
      level: "high",
      title: "Loan payments are eating your income",
      description: `Your EMIs are ${er.toFixed(0)}% of income. Anything above 40% is risky — focus on closing high-interest loans first.`,
    });
  } else if (er > 30) {
    risks.push({
      id: "emi-warn",
      level: "medium",
      title: "Loan burden is getting heavy",
      description: `EMIs at ${er.toFixed(0)}% of income. Avoid taking on more debt for now.`,
    });
  }

  if (p.insurance_type === "none") {
    risks.push({
      id: "insurance",
      level: "high",
      title: "No insurance protection",
      description:
        "One hospital stay can wipe out years of savings. Even a basic ₹5L health policy costs less than ₹500/month.",
    });
  } else if (p.insurance_type === "health" && p.dependents > 0) {
    risks.push({
      id: "term",
      level: "medium",
      title: "Family unprotected if something happens to you",
      description:
        "You have dependents but no term insurance. A pure-term plan is cheap and protects your family financially.",
    });
  }

  if (household && household.uninsuredMembers > 0) {
    risks.push({
      id: "family-uninsured",
      level: "medium",
      title: `${household.uninsuredMembers} family member(s) without insurance`,
      description:
        "Uninsured family members are a major financial risk. Health insurance for parents and a family floater is essential.",
    });
  }

  if (p.monthly_salary > 0 && monthlySurplus(p) < 0) {
    risks.push({
      id: "deficit",
      level: "high",
      title: "You're spending more than you earn",
      description:
        "Your monthly expenses exceed income. This is the most urgent thing to fix — review and cut non-essentials.",
    });
  } else if (savingsRate(p) < 10 && p.monthly_salary > 0) {
    risks.push({
      id: "low-savings",
      level: "medium",
      title: "Saving very little each month",
      description:
        "Aim for at least 20% of income in savings. Even 10% is a strong start — automate it on salary day.",
    });
  }

  return risks;
};

// ---------- Expense categorization ----------
export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Groceries",
  "Rent & Housing",
  "Utilities",
  "Transport & Fuel",
  "Shopping",
  "Entertainment",
  "Health & Medical",
  "Education",
  "EMI & Loans",
  "Insurance",
  "Family Support",
  "Travel",
  "Subscriptions",
  "Other",
] as const;

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Food & Dining": ["zomato", "swiggy", "restaurant", "cafe", "dining", "food"],
  Groceries: ["bigbasket", "blinkit", "grocer", "supermarket", "dmart", "kirana"],
  "Rent & Housing": ["rent", "society", "maintenance", "landlord"],
  Utilities: ["electric", "water", "gas", "internet", "wifi", "mobile", "phone", "recharge"],
  "Transport & Fuel": ["uber", "ola", "petrol", "diesel", "fuel", "metro", "bus", "auto", "cab"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "shopping"],
  Entertainment: ["netflix", "prime", "hotstar", "spotify", "movie", "cinema"],
  "Health & Medical": ["pharmacy", "hospital", "doctor", "medicine", "clinic", "apollo"],
  Education: ["school", "college", "course", "tuition", "udemy", "coursera"],
  "EMI & Loans": ["emi", "loan", "credit card"],
  Insurance: ["insurance", "premium", "policy", "lic"],
  Travel: ["flight", "hotel", "makemytrip", "irctc", "train", "trip"],
  Subscriptions: ["subscription", "membership"],
};

export const guessCategory = (note: string): string => {
  const n = note.toLowerCase();
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((k) => n.includes(k))) return cat;
  }
  return "Other";
};
