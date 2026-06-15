/**
 * @file src/components/ui/__tests__/Button.test.tsx
 * @description Component tests for the Button UI component.
 * Tests rendering, variants, loading state, disabled state, and ARIA attributes.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../Button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole("button", { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("does not call onClick when isLoading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button isLoading onClick={handleClick}>Submit</Button>);
    await user.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("sets aria-disabled=true when disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-disabled", "true");
  });

  it("sets aria-busy=true when loading", () => {
    render(<Button isLoading>Loading</Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-busy", "true");
  });

  it("renders leftIcon when provided", () => {
    const MockIcon = () => <span data-testid="mock-icon" />;
    render(<Button leftIcon={<MockIcon />}>With icon</Button>);
    expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Styled</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("custom-class");
  });

  it("renders as type=submit when specified", () => {
    render(<Button type="submit">Submit form</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("uses aria-label when provided (for icon-only buttons)", () => {
    render(<Button aria-label="Delete item">🗑️</Button>);
    expect(screen.getByRole("button", { name: "Delete item" })).toBeInTheDocument();
  });

  it("renders loading spinner when isLoading=true", () => {
    render(<Button isLoading>Loading</Button>);
    const btn = screen.getByRole("button");
    // Should contain SVG spinner
    expect(btn.querySelector("svg")).toBeInTheDocument();
  });
});
