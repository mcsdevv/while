import type { Metadata } from "next";
import { MermaidDemo } from "@/components/mdx/mermaid-demo";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mermaid Theme Comparison",
  description: "Compare different Mermaid diagram themes and styles",
  robots: "noindex",
};

const SAMPLE_CHART = `graph TB
  User[Client] --> API[Next.js API]
  API --> Auth[Auth Check]
  Auth --> Calendar[Google Calendar API]
  Calendar --> Webhook[Webhook Handler]
  Webhook --> Cron[Cron Job]`;

const SEQUENCE_CHART = `sequenceDiagram
  participant U as User
  participant A as API
  participant G as Google
  U->>A: Request sync
  A->>G: Fetch events
  G-->>A: Events data
  A-->>U: Sync complete`;

const themes = [
  {
    label: "Default",
    description: "Current light theme used in docs",
    themeConfig: { theme: "default" as const },
  },
  {
    label: "Dark",
    description: "Dark mode theme",
    themeConfig: { theme: "dark" as const },
  },
  {
    label: "Forest",
    description: "Green-tinted nature theme",
    themeConfig: { theme: "forest" as const },
  },
  {
    label: "Neutral",
    description: "Black & white, good for documents",
    themeConfig: { theme: "neutral" as const },
  },
  {
    label: "Custom Indigo",
    description: "Brand-colored using base theme",
    themeConfig: {
      theme: "base" as const,
      themeVariables: {
        primaryColor: "#4f46e5",
        primaryTextColor: "#ffffff",
        primaryBorderColor: "#3730a3",
        lineColor: "#6366f1",
        secondaryColor: "#818cf8",
        tertiaryColor: "#c7d2fe",
        background: "#f8fafc",
      },
    },
  },
  {
    label: "Hand-drawn",
    description: "Sketch/Excalidraw-like style",
    themeConfig: {
      theme: "default" as const,
      look: "handDrawn" as const,
    },
  },
];

export default function MermaidDemoPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground mb-4 inline-block"
          >
            ← Back to home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Mermaid Theme Comparison</h1>
          <p className="text-muted-foreground">
            Temporary page to compare different Mermaid styling options.
            Delete before merging.
          </p>
        </div>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Flowchart Comparison</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {themes.map((theme) => (
              <MermaidDemo
                key={theme.label}
                chart={SAMPLE_CHART}
                themeConfig={theme.themeConfig}
                label={theme.label}
                description={theme.description}
              />
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Sequence Diagram Comparison</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {themes.map((theme) => (
              <MermaidDemo
                key={`seq-${theme.label}`}
                chart={SEQUENCE_CHART}
                themeConfig={theme.themeConfig}
                label={theme.label}
                description={theme.description}
              />
            ))}
          </div>
        </section>

        <section className="rounded-lg border bg-muted/50 p-6">
          <h2 className="text-lg font-semibold mb-2">Alternative: D2</h2>
          <p className="text-muted-foreground text-sm">
            D2 is a modern diagramming language that produces higher-quality diagrams out of
            the box. Features include publication-quality themes, built-in sketch mode, and
            CSS animations. Requires a server-side binary or external service to render.
          </p>
          <a
            href="https://d2lang.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline mt-2 inline-block"
          >
            Learn more about D2 →
          </a>
        </section>
      </div>
    </main>
  );
}
