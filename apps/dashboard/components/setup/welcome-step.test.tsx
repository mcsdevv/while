import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WelcomeStep } from "./welcome-step";

// Mock the UI components and CopyValue
vi.mock("@while/ui", () => ({
  Button: ({
    children,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

vi.mock("./copy-value", () => ({
  CopyValue: ({ value, label }: { value: string; label?: string }) => (
    <div data-testid="copy-value">
      {label && <span data-testid="copy-value-label">{label}</span>}
      <span data-testid="copy-value-content">{value}</span>
    </div>
  ),
}));

describe("WelcomeStep", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    it("renders the intro text", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(
        screen.getByText(/This wizard will help you connect your Google Calendar/),
      ).toBeInTheDocument();
    });

    it("renders the 7-day token warning", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByText("Token expiration notice")).toBeInTheDocument();
      expect(screen.getByText(/OAuth tokens expire every 7 days/)).toBeInTheDocument();
    });

    it("renders link to publish OAuth app in warning", () => {
      render(<WelcomeStep onNext={() => {}} />);

      const publishLink = screen.getByRole("link", { name: /publish your OAuth app/ });
      expect(publishLink).toHaveAttribute(
        "href",
        "https://while.so/docs/setup/google#step-5-publish-app-optional",
      );
      expect(publishLink).toHaveAttribute("target", "_blank");
      expect(publishLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders the prerequisites section", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByText("Prerequisites")).toBeInTheDocument();
      expect(screen.getByText(/Google Cloud project with Calendar API/)).toBeInTheDocument();
      expect(screen.getByText(/Notion integration with access/)).toBeInTheDocument();
      expect(screen.getByText(/Share your Notion database/)).toBeInTheDocument();
    });

    it("renders external links with security attributes", () => {
      render(<WelcomeStep onNext={() => {}} />);

      const googleLink = screen.getByRole("link", { name: /Create credentials/i });
      expect(googleLink).toHaveAttribute(
        "href",
        "https://console.cloud.google.com/apis/credentials",
      );
      expect(googleLink).toHaveAttribute("target", "_blank");
      expect(googleLink).toHaveAttribute("rel", "noopener noreferrer");

      const notionLink = screen.getByRole("link", { name: /Create integration/i });
      expect(notionLink).toHaveAttribute("href", "https://www.notion.so/my-integrations");
      expect(notionLink).toHaveAttribute("target", "_blank");
      expect(notionLink).toHaveAttribute("rel", "noopener noreferrer");
    });

    it("renders the Get Started button", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByRole("button", { name: /Get Started/i })).toBeInTheDocument();
    });
  });

  describe("OAuth configuration section", () => {
    it("renders the OAuth configuration header", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByText("Google OAuth Configuration Values")).toBeInTheDocument();
    });

    it("OAuth configuration values are always visible", () => {
      render(<WelcomeStep onNext={() => {}} />);

      // CopyValue components should be visible immediately
      expect(screen.getAllByTestId("copy-value")).toHaveLength(2);
    });

    it("shows redirect URI", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByText("Authorized Redirect URI")).toBeInTheDocument();
    });

    it("shows OAuth scopes", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByText("OAuth Scopes (for consent screen)")).toBeInTheDocument();
    });

    it("shows scopes value with all required scopes", () => {
      render(<WelcomeStep onNext={() => {}} />);

      const scopesValue = screen
        .getAllByTestId("copy-value-content")
        .find((el) => el.textContent?.includes("openid"));
      expect(scopesValue?.textContent).toContain("openid");
      expect(scopesValue?.textContent).toContain("email");
      expect(scopesValue?.textContent).toContain("profile");
      expect(scopesValue?.textContent).toContain("googleapis.com/auth/calendar");
    });

    it("shows additional links", () => {
      render(<WelcomeStep onNext={() => {}} />);

      expect(screen.getByRole("link", { name: /Google Cloud Credentials/i })).toHaveAttribute(
        "href",
        "https://console.cloud.google.com/apis/credentials",
      );
      expect(screen.getByRole("link", { name: /Full Setup Guide/i })).toHaveAttribute(
        "href",
        "https://while.so/docs/setup/google",
      );
    });
  });

  describe("onNext callback", () => {
    it("calls onNext when Get Started button is clicked", () => {
      const onNextMock = vi.fn();
      render(<WelcomeStep onNext={onNextMock} />);

      fireEvent.click(screen.getByRole("button", { name: /Get Started/i }));

      expect(onNextMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("accessibility", () => {
    it("warning icon has aria-hidden", () => {
      render(<WelcomeStep onNext={() => {}} />);

      const warningContainer = screen.getByText("Token expiration notice").closest("div");
      const warningIcon = warningContainer?.parentElement?.querySelector("svg");
      expect(warningIcon).toHaveAttribute("aria-hidden", "true");
    });

    it("all external links have proper security attributes", () => {
      render(<WelcomeStep onNext={() => {}} />);

      const externalLinks = screen.getAllByRole("link");
      for (const link of externalLinks) {
        if (link.getAttribute("target") === "_blank") {
          expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
          expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
        }
      }
    });
  });
});
