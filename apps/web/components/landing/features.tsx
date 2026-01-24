import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@notion-gcal-sync/ui";
import {
  ArrowLeftRight,
  Gauge,
  Lock,
  Settings2,
  Sparkles,
  Zap,
} from "lucide-react";

const features = [
  {
    title: "Bidirectional Sync",
    description:
      "Changes flow both ways. Edit in Notion or Google Calendar - both stay perfectly in sync.",
    icon: ArrowLeftRight,
  },
  {
    title: "Real-time Updates",
    description:
      "Webhook-driven synchronization means your changes propagate instantly, not on a schedule.",
    icon: Zap,
  },
  {
    title: "Web Setup Wizard",
    description:
      "No CLI commands or manual token copying. A friendly web interface guides you through setup.",
    icon: Sparkles,
  },
  {
    title: "Custom Field Mapping",
    description:
      "Map any Notion property to Google Calendar fields. Full control over how your data syncs.",
    icon: Settings2,
  },
  {
    title: "Encrypted Storage",
    description:
      "Your credentials are encrypted with AES-256-GCM. Self-hosted means you control your data.",
    icon: Lock,
  },
  {
    title: "Dashboard Monitoring",
    description:
      "Track sync health, view logs, and monitor operations from a clean dashboard interface.",
    icon: Gauge,
  },
];

export function Features() {
  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need for seamless sync
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Built for reliability, security, and ease of use. No compromises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 bg-card/50">
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-foreground/10 bg-foreground/5">
                  <feature.icon className="h-5 w-5 text-foreground" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
