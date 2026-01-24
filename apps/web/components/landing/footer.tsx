import Link from "next/link";
import { Github, ExternalLink } from "lucide-react";

const links = {
  product: [
    { name: "Documentation", href: "/docs", external: false },
    { name: "GitHub", href: "https://github.com/mcsdevv/gcal-notion-sync", external: true },
    { name: "Issues", href: "https://github.com/mcsdevv/gcal-notion-sync/issues", external: true },
  ],
  resources: [
    { name: "Setup Guide", href: "/docs/quickstart", external: false },
    { name: "Troubleshooting", href: "/docs/guides/troubleshooting", external: false },
    { name: "Architecture", href: "/docs/architecture", external: false },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-muted">
                <span className="text-sm font-medium text-foreground">N</span>
              </div>
              <span className="font-medium">Notion-GCal Sync</span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Open-source, self-hosted bidirectional sync between Notion and Google Calendar.
              Built with privacy and reliability in mind.
            </p>
            <div className="mt-4 flex gap-4">
              <a
                href="https://github.com/mcsdevv/gcal-notion-sync"
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
            <h3 className="font-medium">Product</h3>
            <ul className="mt-4 space-y-2">
              {links.product.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="font-medium">Resources</h3>
            <ul className="mt-4 space-y-2">
              {links.resources.map((link) => (
                <li key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack & License */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            A project by{" "}
            <a
              href="https://mcs.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Matthew Sweeney
            </a>
          </p>
          <p className="text-sm text-muted-foreground">
            Released under the{" "}
            <a
              href="https://github.com/mcsdevv/gcal-notion-sync/blob/main/LICENSE"
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
