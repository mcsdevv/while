import { Button } from "@notion-gcal-sync/ui";
import { ArrowRight, BookOpen } from "lucide-react";

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fnotion-gcal-sync%2Ftree%2Fmain%2Fapps%2Fdashboard&env=NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,NOTION_CLIENT_ID,NOTION_CLIENT_SECRET,ENCRYPTION_KEY&envDescription=Required%20environment%20variables%20for%20the%20sync%20app&envLink=https%3A%2F%2Fdocs.notion-gcal-sync.com%2Fsetup%2Fvercel&project-name=notion-gcal-sync&repository-name=notion-gcal-sync";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,rgba(59,130,246,0.12),transparent)]" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Open Source & Self-Hosted</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Keep Notion and Google Calendar in{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Perfect Sync
            </span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
            Bidirectional, real-time synchronization between your Notion calendar database and
            Google Calendar. No more double-entry. No more missed events.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2">
              <a href={DEPLOY_URL} target="_blank" rel="noopener noreferrer">
                Deploy to Vercel
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild className="gap-2">
              <a href="https://docs.notion-gcal-sync.com" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4" />
                View Documentation
              </a>
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free forever. Deploy in under 5 minutes.
          </p>
        </div>
      </div>
    </section>
  );
}
