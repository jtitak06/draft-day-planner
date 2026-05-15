import { createFileRoute } from "@tanstack/react-router";
import { AuthHeader } from "@/components/AuthHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use · Best Ball Scheduler" },
      { name: "description", content: "Terms of Use for Best Ball Scheduler." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <AuthHeader />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Terms of Use</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: May 15, 2026</p>

        <div className="prose prose-sm mt-8 max-w-none text-foreground space-y-6">
          <section>
            <h2 className="text-xl font-semibold">Acceptance</h2>
            <p className="text-muted-foreground">
              By accessing or using Best Ball Scheduler (the "Service"), you agree to these
              Terms of Use. If you do not agree, do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">No affiliation</h2>
            <p className="text-muted-foreground">
              Best Ball Scheduler is an independent tool. We are not affiliated with,
              endorsed by, or sponsored by Underdog Fantasy or any other fantasy sports
              operator. "Best Ball Mania" is the property of its respective owner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Accounts</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your login
              credentials and for all activity under your account. Notify us promptly of any
              unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Payments and access</h2>
            <p className="text-muted-foreground">
              Paid access is a one-time purchase that grants access to premium features
              through December 31 of the calendar year of purchase. Payments are processed
              by Stripe. All sales are final and non-refundable except where required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Acceptable use</h2>
            <p className="text-muted-foreground">
              You agree not to misuse the Service, including by attempting to access it
              using automated means, reselling output, scraping data, reverse engineering,
              or interfering with its operation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">No warranty</h2>
            <p className="text-muted-foreground">
              The Service is provided "as is" without warranties of any kind. Schedules and
              analyses are informational projections based on historical data and do not
              guarantee any outcome. You are solely responsible for your draft decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Limitation of liability</h2>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Best Ball Scheduler will not be liable
              for any indirect, incidental, special, or consequential damages, or for any
              loss of profits or revenues, arising out of your use of the Service. Our total
              liability for any claim relating to the Service will not exceed the amount you
              paid us in the prior twelve months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Termination</h2>
            <p className="text-muted-foreground">
              We may suspend or terminate access to the Service at any time for violation of
              these Terms or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Changes</h2>
            <p className="text-muted-foreground">
              We may update these Terms from time to time. Continued use of the Service
              after changes become effective constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="text-muted-foreground">
              Questions about these Terms? Email bestballscheduler@gmail.com.
            </p>
          </section>
        </div>
      </article>
      <SiteFooter />
    </main>
  );
}