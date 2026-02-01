"use client";

import { Card, CardContent } from "@while/ui";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface FAQAccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export function FAQAccordionItem({ title, children }: FAQAccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
      >
        <span className="font-medium">{title}</span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      {isOpen && (
        <CardContent className="border-t px-6 py-5 prose prose-sm dark:prose-invert max-w-none">
          {children}
        </CardContent>
      )}
    </Card>
  );
}

interface FAQAccordionProps {
  children: React.ReactNode;
}

export function FAQAccordion({ children }: FAQAccordionProps) {
  return <div className="space-y-4 not-prose">{children}</div>;
}
