import { Button } from "@while/ui";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

const DEPLOY_URL =
  "https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmcsdevv%2Fwhile-dashboard-template&env=NEXTAUTH_SECRET,GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET,NOTION_API_TOKEN,AUTHORIZED_EMAILS&envDescription=Required%20environment%20variables%20for%20While&envLink=https%3A%2F%2Fwhile.so%2Fdocs%2Fsetup%2Fvercel&project-name=while&repository-name=while&stores=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22upstash%22%2C%22productSlug%22%3A%22upstash-kv%22%7D%5D";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur">
            <span className="flex h-2 w-2 rounded-full bg-foreground" />
            <span className="text-muted-foreground">Open Source & Self-Hosted</span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Keep Notion and Google Calendar in <span className="text-foreground">Perfect Sync</span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
            Bidirectional, real-time synchronization between your Notion calendar database and
            Google Calendar. No more double-entry. No more missed events.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              render={<a href={DEPLOY_URL} target="_blank" rel="noopener noreferrer" />}
              className="gap-2"
            >
              Deploy to Vercel
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              render={<Link href="/docs" />}
              className="gap-2"
            >
              <BookOpen aria-hidden="true" className="h-4 w-4" />
              View Documentation
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
