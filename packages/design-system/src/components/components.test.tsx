import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { afterEach, describe, expect, it } from "vitest";
import { ActionTile, Button, SkipLink } from "./actions";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { EmptyState, ErrorSummary, LoadingState, SafetyNotice } from "./states";

afterEach(cleanup);

async function expectNoAxeViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container, {
    rules: { "color-contrast": { enabled: true } },
  });
  expect(results.violations).toEqual([]);
}

describe("SkipLink", () => {
  it("is hidden until focused, then visible and keyboard reachable", async () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to main content" });
    const user = userEvent.setup();
    await user.tab();
    expect(link).toHaveFocus();
    expect(link).toBeVisible();
    expect(link).toHaveAttribute("href", "#main-content");
  });

  it("passes axe", async () => {
    const { container } = render(<SkipLink />);
    await expectNoAxeViolations(container);
  });
});

describe("Button", () => {
  it.each(["secondary", "primary", "selected"] as const)("variant %s passes axe", async (variant) => {
    const { container } = render(<Button variant={variant}>Label</Button>);
    await expectNoAxeViolations(container);
  });

  it("has a visible focus indicator class and is keyboard operable", async () => {
    const onClick = vi.fn();
    render(
      <Button variant="primary" onClick={onClick}>
        Use my location
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Use my location" });
    const user = userEvent.setup();
    await user.tab();
    expect(button).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe("ActionTile", () => {
  it("activates with Enter and Space and exposes the active state textually", async () => {
    const onClick = vi.fn();
    const { rerender } = render(<ActionTile label="Where can I go?" onClick={onClick} />);
    const user = userEvent.setup();
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);

    rerender(<ActionTile label="Where can I go?" consequence="Shows a map of your comfortable reach" active onClick={onClick} />);
    expect(screen.getByRole("button", { name: /Where can I go\?/ })).toHaveAttribute("aria-current", "true");
    expect(screen.getByText("Shows a map of your comfortable reach")).toBeInTheDocument();
  });

  it("passes axe with icon, consequence and long label text", async () => {
    const { container } = render(
      <ActionTile
        label="Find a park with an extremely long multi-clause label that wraps across several lines on a narrow screen"
        consequence="Lists parks matched to your preferences, including what we do not know"
      />,
    );
    await expectNoAxeViolations(container);
  });
});

describe("ConfidenceBadge", () => {
  it.each(["verified", "mapped", "community_verified", "inferred", "unknown"] as const)(
    "%s always carries a word, never colour alone",
    (label) => {
      render(<ConfidenceBadge label={label} meta="Leeds City Council · 2026-06" />);
      const badge = screen.getByText(label.replace(/_/g, " "));
      expect(badge).toBeInTheDocument();
      expect(screen.getByText(/Leeds City Council/)).toBeInTheDocument();
      cleanup();
    },
  );

  it.each(["verified", "unknown"] as const)("variant %s passes axe", async (label) => {
    const { container } = render(<ConfidenceBadge label={label} meta="OSM · 2026-08" />);
    await expectNoAxeViolations(container);
  });

  it("supports human phrases over jargon", () => {
    render(<ConfidenceBadge label="unknown" phrase="We don't know whether this path is step-free" />);
    expect(screen.getByText("We don't know whether this path is step-free")).toBeInTheDocument();
  });
});

describe("SafetyNotice", () => {
  it("is a role=note block with heading and body", () => {
    render(
      <SafetyNotice title="Plan, don't navigate">
        This is planning assistance, not a guarantee of safety or accessibility.
      </SafetyNotice>,
    );
    expect(screen.getByRole("note")).toContainElement(screen.getByText("Plan, don't navigate", { selector: "p" }));
  });

  it("passes axe", async () => {
    const { container } = render(
      <SafetyNotice title="Plan, don't navigate">Check the journey before you set out.</SafetyNotice>,
    );
    await expectNoAxeViolations(container);
  });
});

describe("states", () => {
  it("LoadingState exposes aria-busy and role=status", () => {
    render(<LoadingState message="Finding places" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });

  it("EmptyState renders message with action", () => {
    render(<EmptyState message="No places match yet" action={<Button>Clear filters</Button>} />);
    expect(screen.getByText("No places match yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
  });

  it("ErrorSummary is role=alert with one list entry per error", () => {
    render(<ErrorSummary title="We couldn't finish that" errors={["Postcode not recognised", "Connection lost"]} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("ErrorSummary passes axe", async () => {
    const { container } = render(<ErrorSummary title="Errors" errors={["Something failed"]} />);
    await expectNoAxeViolations(container);
  });
});
