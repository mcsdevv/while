import { Github, ExternalLink } from "lucide-react";

const links = {
  product: [
    { name: "Documentation", href: "https://docs.notion-gcal-sync.com" },
    { name: "GitHub", href: "https://github.com/mcsdevv/notion-gcal-sync" },
    { name: "Issues", href: "https://github.com/mcsdevv/notion-gcal-sync/issues" },
  ],
  resources: [
    { name: "Setup Guide", href: "https://docs.notion-gcal-sync.com/quickstart" },
    { name: "Troubleshooting", href: "https://docs.notion-gcal-sync.com/guides/troubleshooting" },
    { name: "Architecture", href: "https://docs.notion-gcal-sync.com/architecture" },
  ],
};

const techStack = [
  { name: "Next.js", href: "https://nextjs.org" },
  { name: "Vercel", href: "https://vercel.com" },
  { name: "Upstash", href: "https://upstash.com" },
  { name: "Tailwind CSS", href: "https://tailwindcss.com" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">N</span>
              </div>
              <span className="font-semibold">Notion-GCal Sync</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Open-source, self-hosted bidirectional sync between Notion and Google Calendar.
              Built with privacy and reliability in mind.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://github.com/mcsdevv/notion-gcal-sync"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="GitHub repository"
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold">Product</h3>
            <ul className="mt-4 space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-semibold">Resources</h3>
            <ul className="mt-4 space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack & License */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>Built with</span>
            {techStack.map((tech, index) => (
              <span key={tech.name} className="flex items-center gap-1">
                <a
                  href={tech.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground"
                >
                  {tech.name}
                </a>
                {index < techStack.length - 1 && <span className="text-muted-foreground/50">·</span>}
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Released under the{" "}
            <a
              href="https://github.com/mcsdevv/notion-gcal-sync/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              MIT License
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
