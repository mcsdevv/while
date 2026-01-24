"use client";

import { Card, CardContent } from "@notion-gcal-sync/ui";
import { ChevronDown } from "lucide-react";
import * as React from "react";

const faqs = [
  {
    question: "How does the sync work?",
    answer:
      "Google Calendar changes are captured via webhooks for instant updates. Notion changes are detected through polling every 2 minutes. Both directions use intelligent conflict resolution to ensure your data stays consistent.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. This is a self-hosted solution - you deploy it to your own Vercel account. Your OAuth credentials are encrypted with AES-256-GCM and stored in your own Redis instance. No data ever passes through third-party servers.",
  },
  {
    question: "How much does it cost?",
    answer:
      "It's completely free. The app runs on Vercel's free tier and uses Upstash Redis's free tier for storage. You own and control everything.",
  },
  {
    question: "Why do my tokens expire after 7 days?",
    answer:
      "This happens when your Google OAuth app is in 'Testing' mode. To fix it, go to Google Cloud Console and publish your OAuth app. This removes the 7-day token expiration limit.",
  },
  {
    question: "Can I sync multiple calendars?",
    answer:
      "Each deployment syncs one Google Calendar with one Notion database. To sync multiple calendars, deploy multiple instances. Each instance is independent and can have different configurations.",
  },
  {
    question: "What if sync stops working?",
    answer:
      "Check the dashboard for error messages and logs. Common issues include expired tokens (re-authenticate), changed field mappings (update in settings), or rate limits (wait and retry). The troubleshooting guide covers all common scenarios.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  return (
    <section className="py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Everything you need to know about the sync.{" "}
            <a
              href="https://docs.notion-gcal-sync.com/faq"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View full FAQ
            </a>
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-medium">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      openIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <CardContent className="border-t pt-4">
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
