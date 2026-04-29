import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Asset, Liability } from "@/lib/finance";

export const useNetWorthData = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) { setAssets([]); setLiabilities([]); setLoading(false); return; }
    setLoading(true);
    const [a, l] = await Promise.all([
      supabase.from("assets").select("*").eq("user_id", user.id).order("created_at"),
      supabase.from("liabilities").select("*").eq("user_id", user.id).order("created_at"),
    ]);
    setAssets((a.data || []).map((d: any) => ({
      id: d.id, type: d.type, name: d.name,
      current_value: Number(d.current_value) || 0, owner: d.owner || "self",
    })));
    setLiabilities((l.data || []).map((d: any) => ({
      id: d.id, type: d.type, name: d.name,
      outstanding: Number(d.outstanding) || 0,
      emi: Number(d.emi) || 0,
      interest_rate: Number(d.interest_rate) || 0,
    })));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  return { assets, liabilities, loading, refetch: fetchAll };
};
