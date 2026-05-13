import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccess } from "@/lib/access.functions";

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useAccess() {
  const { user, loading: userLoading } = useAuthUser();
  const fetchAccess = useServerFn(getMyAccess);

  const query = useQuery({
    queryKey: ["my-access", user?.id ?? "anon"],
    queryFn: () => fetchAccess(),
    enabled: Boolean(user),
    staleTime: 60_000,
  });

  return {
    user,
    userLoading,
    hasAccess: Boolean(user && query.data?.hasAccess),
    expiresAt: query.data?.expiresAt ?? null,
    accessLoading: userLoading || (Boolean(user) && query.isLoading),
  };
}