import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axe from "axe-core";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { AppProvider } from "../state/app";
import { MapProvider } from "../state/map";
import { Home } from "../pages/Home";
import { Preferences } from "../pages/Preferences";
import { ReachView } from "../pages/ReachView";
import { Confidence } from "../pages/Confidence";
import { Settings } from "../pages/Settings";
import { computeReach } from "../fixtures/synthetic";
import { DEFAULT_PREFERENCES } from "../state/app";

function renderAt(ui: React.ReactElement, path = "/") {
  return render(
    <MapProvider>
      <AppProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="*" element={ui} />
          </Routes>
        </MemoryRouter>
      </AppProvider>
    </MapProvider>,
  );
}

// All fetches resolve as "no live API" so tests exercise the fallback register.
beforeAll(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.reject(new Error("API unavailable in tests"))),
  );
});

async function expectNoAxeViolations(container: HTMLElement): Promise<void> {
  const results = await axe.run(container);
  expect(results.violations).toEqual([]);
}

describe("computeReach determinism (A07)", () => {
  it("returns identical numbers for identical inputs", () => {
    const a = computeReach(DEFAULT_PREFERENCES, 20);
    const b = computeReach(DEFAULT_PREFERENCES, 20);
    expect(a).toEqual(b);
    expect(a.personalMinutes).toBe(20);
  });

  it("contracts reach for relaxed step-avoiding preferences", () => {
    const prefs = { ...DEFAULT_PREFERENCES, speed: "slow" as const, steps: "avoid_completely" as const };
    const result = computeReach(prefs, 20);
    expect(result.personalMinutes).toBe(13.5);
    expect(result.personalMetres).toBe(1080);
  });
});

describe("Home (P01)", () => {
  it("renders the four actions and data status from the fallback register", async () => {
    renderAt(<Home />);
    expect(screen.getByRole("button", { name: /Where can I go\?/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Take me there/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /I need something/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Find a park/ })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("Leeds source register loaded")).toBeInTheDocument());
  });

  it("keeps the place input path usable when location is denied (A04)", async () => {
    vi.stubGlobal("navigator", {
      ...navigator,
      geolocation: {
        getCurrentPosition: (_success: unknown, error: (e: unknown) => void) =>
          error(new Error("denied")),
      },
    });
    const { container } = renderAt(<Home />);
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Use my current location" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Location is off. Enter a place or postcode instead."),
    );
    const input = screen.getByLabelText("Start from a place or postcode");
    await user.type(input, "LS1 3AD");
    await user.keyboard("{Enter}");
    // The geocoder is unreachable in tests → the honest fallback message.
    await waitFor(() =>
      expect(screen.getByText(/geocoder is unreachable/i)).toBeInTheDocument(),
    );
    await expectNoAxeViolations(container);
  });

  it("passes axe on the home screen", async () => {
    const { container } = renderAt(<Home />);
    await waitFor(() => expect(screen.getByText("Leeds source register loaded")).toBeInTheDocument());
    await expectNoAxeViolations(container);
  });
});

describe("Preferences (P02)", () => {
  it("saves to the device and shows plain-language effects", async () => {
    const { container } = renderAt(<Preferences />);
    const user = userEvent.setup();
    expect(screen.getByText("Avoid completely")).toBeInTheDocument();
    await user.click(screen.getByText("Brisk"));
    await user.click(screen.getByRole("button", { name: "Save preferences" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Journey preferences saved on this device"),
    );
    if (typeof localStorage !== "undefined") {
      const stored = JSON.parse(localStorage.getItem("within-reach-preferences-v1") ?? "{}");
      expect(stored.speed).toBe("fast");
    }
    await expectNoAxeViolations(container);
  });
});

describe("Reach view (P03/P04, A07)", () => {
  it("shows deterministic personal minutes, tabs and safety copy with the API unavailable", async () => {
    const { container } = renderAt(<ReachView initialTab="plan" />);
    const user = userEvent.setup();
    // No origin → example flow: set via home is not available here, so use the plan tab's example button.
    const example = screen.queryByRole("button", { name: /use Park Square/i });
    if (example) await user.click(example);
    await user.click(screen.getByRole("button", { name: "Show my reach" }));

    await waitFor(() =>
      expect(screen.getAllByText(/comfortable minutes from/).length).toBeGreaterThan(0),
    );
    // Deterministic time-budget share for default preferences.
    expect(screen.getByText(/100%/)).toBeInTheDocument();
    // Real-data honesty: router unreachable → disclosed, never guessed.
    await waitFor(() => expect(screen.getByText(/router could not draw rings/i)).toBeInTheDocument());
    await expectNoAxeViolations(container);
  });
});

describe("Confidence and Settings", () => {
  it("explains all five labels and lists the register with prohibitions visible", async () => {
    const { container } = renderAt(<Confidence />);
    await waitFor(() => expect(screen.getByText("Legacy public toilets")).toBeInTheDocument());
    expect(screen.getByText(/prohibited as current/)).toBeInTheDocument();
    expect(screen.getByText("Unknown")).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });

  it("settings states there is no analytics (no fake toggles)", async () => {
    const { container } = renderAt(<Settings />);
    expect(screen.getByText(/contains no analytics/)).toBeInTheDocument();
    await expectNoAxeViolations(container);
  });
});
