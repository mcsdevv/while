import { Calendar, CheckCircle2, Rocket } from "lucide-react";

const StepArrow = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className="text-muted-foreground/40"
    aria-hidden="true"
  >
    <line
      x1="5"
      y1="12"
      x2="17"
      y2="12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <polyline
      points="14,8 19,12 14,16"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

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
    <section className="border-y border-border bg-muted/50 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
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
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <span className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Step {step.number}
                  </span>
                  <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="absolute left-full top-7 hidden translate-x-1 md:block">
                    <StepArrow />
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
