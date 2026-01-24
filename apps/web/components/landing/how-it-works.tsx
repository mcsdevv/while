import { ArrowRight, Calendar, CheckCircle2, Rocket } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Deploy to Vercel",
    description:
      "One-click deployment to Vercel. Your own instance, running on the free tier.",
    icon: Rocket,
  },
  {
    number: "02",
    title: "Connect Your Accounts",
    description:
      "Follow the setup wizard to connect Google Calendar and Notion. No coding required.",
    icon: Calendar,
  },
  {
    number: "03",
    title: "Events Sync Automatically",
    description:
      "That's it! Your events now sync bidirectionally in real-time.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section className="border-y bg-muted/30 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Up and running in 5 minutes
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            No complex setup. No maintenance headaches. Just click, connect, and sync.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    Step {step.number}
                  </span>
                  <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute right-0 top-8 hidden -translate-x-1/2 md:block">
                    <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
