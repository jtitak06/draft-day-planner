import { createFileRoute } from "@tanstack/react-router";
import { AuthHeader } from "@/components/AuthHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy · Best Ball Scheduler" },
      { name: "description", content: "Privacy Policy for Best Ball Scheduler." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <AuthHeader />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: May 15, 2026</p>

        <div className="prose prose-sm mt-8 max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Who we are</h2>
            <p className="text-muted-foreground">
              Best Ball Scheduler ("we", "us") operates this website to help users plan their
              Best Ball Mania drafts. Contact: bestballscheduler@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Information we collect</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Account information: email address and authentication credentials.</li>
              <li>Purchase information: limited Stripe checkout metadata (session ID, email, payment status). Card details are handled directly by Stripe and never reach our servers.</li>
              <li>Usage inputs you submit (number of entries, projected fill date) used only to generate your schedule.</li>
              <li>Standard server logs (IP address, user agent, timestamps) for security and debugging.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">How we use information</h2>
            <ul className="list-disc pl-6 text-muted-foreground">
              <li>Provide and maintain the scheduler and your paid access.</li>
              <li>Process payments via Stripe and grant access on successful checkout.</li>
              <li>Send transactional emails (account setup, password reset, receipts).</li>
              <li>Detect, prevent, and respond to fraud or abuse.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Sharing</h2>
            <p className="text-muted-foreground">
              We do not sell your personal information. We share data only with service providers
              that power the site: Stripe (payments), Supabase (database and authentication),
              and our hosting provider. Each processes data on our behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Data retention</h2>
            <p className="text-muted-foreground">
              We retain account and purchase records as long as your account is active and as
              needed to comply with legal obligations. You may request deletion at any time by
              emailing us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Your rights</h2>
            <p className="text-muted-foreground">
              You may request access to, correction of, or deletion of your personal data by
              contacting bestballscheduler@gmail.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Cookies</h2>
            <p className="text-muted-foreground">
              We use only essential cookies and local storage required to keep you signed in.
              We do not use advertising or third-party tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Changes</h2>
            <p className="text-muted-foreground">
              We may update this policy from time to time. Material changes will be reflected
              by an updated "Last updated" date above.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}