import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAccess } from "@/hooks/use-access";
import { supabase } from "@/integrations/supabase/client";

export function AuthHeader() {
  const { user, userLoading, hasAccess } = useAccess();

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-3">
      {userLoading ? null : user ? (
        <>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            {user.email}
            {hasAccess ? null : " · access expired"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            Sign out
          </Button>
        </>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link to="/login">Sign in</Link>
        </Button>
      )}
    </div>
  );
}