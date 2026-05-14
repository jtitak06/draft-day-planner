import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { verifyCheckoutAndGrantAccess } from "@/lib/access.functions";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome · BBM Draft Scheduler" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    session_id: typeof s.session_id === "string" ? s.session_id : undefined,
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const { session_id } = Route.useSearch();
  const navigate = useNavigate();
  const verify = useServerFn(verifyCheckoutAndGrantAccess);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "missing">(
    session_id ? "loading" : "missing",
  );
  const [email, setEmail] = useState<string>("");
  const [hasAccount, setHasAccount] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session_id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await verify({ data: { session_id } });
        if (cancelled) return;
        if (!res.ok) {
          setErrorMsg(res.reason);
          setStatus("error");
          return;
        }
        setEmail(res.email);
        setHasAccount(res.hasAccount);
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setErrorMsg(e instanceof Error ? e.message : "Verification failed.");
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session_id, verify]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created! Check your email to confirm, then sign in.");
    navigate({ to: "/login" });
  };

  const onGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/`,
    });
    if ("error" in result && result.error) toast.error(result.error.message);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
        {status === "missing" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">No checkout session</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We couldn't find a Stripe checkout session in this URL. If you just
              paid, please use the link Stripe sent to your email.
            </p>
            <Button asChild className="mt-6 w-full">
              <Link to="/login">Go to sign in</Link>
            </Button>
          </>
        )}

        {status === "loading" && (
          <p className="text-sm text-muted-foreground">Verifying your purchase…</p>
        )}

        {status === "error" && (
          <>
            <h1 className="text-xl font-semibold text-foreground">
              We couldn't verify your purchase
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMsg}</p>
            <Button asChild className="mt-6 w-full">
              <Link to="/login">Go to sign in</Link>
            </Button>
          </>
        )}

        {status === "ready" && (
          <>
            <h1 className="text-2xl font-bold text-foreground">Welcome!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Payment confirmed for{" "}
              <span className="font-medium text-foreground">{email}</span>. Access
              is active for the rest of the calendar year.
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              We've also emailed you a link to set your password — check your
              inbox if you'd rather finish setup later.
            </p>

            {hasAccount ? (
              <div className="mt-6 space-y-3">
                <p className="text-sm text-muted-foreground">
                  An account already exists for this email.
                </p>
                <Button asChild className="w-full">
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            ) : (
              <>
                <form onSubmit={onCreate} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Choose a password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Creating account…" : "Create account"}
                  </Button>
                </form>

                <div className="my-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button variant="outline" className="w-full" onClick={onGoogle}>
                  Continue with Google
                </Button>
                <p className="mt-3 text-xs text-muted-foreground">
                  Use the same email ({email}) when signing in with Google.
                </p>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}