import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useFinancialProfile } from "@/hooks/useFinancialProfile";
import Landing from "./Landing";

const Index = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useFinancialProfile();

  if (!authLoading && !user) return <Landing />;

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft">
        <div className="h-12 w-12 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return <Navigate to="/app" replace />;
};

export default Index;
