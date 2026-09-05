import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// jsdom lacks canvas; axe tolerates it but logs noise — stub it out.
if (typeof HTMLCanvasElement !== "undefined") {
  HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext;
}

function clearStorage(storage: Storage | undefined): void {
  try {
    storage?.clear();
  } catch {
    // storage may be unavailable
  }
}

afterEach(() => {
  cleanup();
  clearStorage(globalThis.localStorage);
  clearStorage(globalThis.sessionStorage);
  delete document.body.dataset.mapMode;
});
