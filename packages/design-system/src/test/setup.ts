import "@testing-library/jest-dom/vitest";

// Inject the real design tokens + component styles so axe contrast checks run
// against the shipped palette rather than browser defaults.
import "../styles/tokens.css";
import "../styles/components.css";
