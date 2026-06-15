/**
 * @file src/components/ui/__tests__/RangeSlider.test.tsx
 * @description Component tests for the accessible RangeSlider component.
 * Tests ARIA attributes, value display, label association, and change events.
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RangeSlider } from "../RangeSlider";

describe("RangeSlider", () => {
  const defaultProps = {
    label: "Monthly Driving",
    value: 200,
    min: 0,
    max: 3000,
    step: 50,
    valueLabel: "200 km",
    onChange: vi.fn(),
  };

  it("renders the label text", () => {
    render(<RangeSlider {...defaultProps} />);
    expect(screen.getByText("Monthly Driving")).toBeInTheDocument();
  });

  it("renders the value label", () => {
    render(<RangeSlider {...defaultProps} />);
    expect(screen.getByText("200 km")).toBeInTheDocument();
  });

  it("has correct aria-label on the input", () => {
    render(<RangeSlider {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-label", "Monthly Driving");
  });

  it("sets aria-valuemin correctly", () => {
    render(<RangeSlider {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemin", "0");
  });

  it("sets aria-valuemax correctly", () => {
    render(<RangeSlider {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuemax", "3000");
  });

  it("sets aria-valuenow to the current value", () => {
    render(<RangeSlider {...defaultProps} value={500} valueLabel="500 km" />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuenow", "500");
  });

  it("sets aria-valuetext when ariaValueText is provided", () => {
    render(
      <RangeSlider
        {...defaultProps}
        ariaValueText="200 kilometers per month"
      />
    );
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuetext", "200 kilometers per month");
  });

  it("falls back to valueLabel for aria-valuetext", () => {
    render(<RangeSlider {...defaultProps} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-valuetext", "200 km");
  });

  it("renders hint text when provided", () => {
    render(<RangeSlider {...defaultProps} hint="Adjust for your typical commute" />);
    expect(screen.getByText("Adjust for your typical commute")).toBeInTheDocument();
  });

  it("renders CO₂ label when provided", () => {
    render(<RangeSlider {...defaultProps} co2Label="36 kg CO₂" />);
    expect(screen.getByText("36 kg CO₂")).toBeInTheDocument();
  });

  it("label is linked to the input via htmlFor/id", () => {
    render(<RangeSlider {...defaultProps} />);
    const slider = screen.getByRole("slider");
    const label = screen.getByText("Monthly Driving");
    expect(label.tagName).toBe("LABEL");
    expect(label).toHaveAttribute("for", slider.id);
  });

  it("calls onChange when value changes", () => {
    const handleChange = vi.fn();
    render(<RangeSlider {...defaultProps} onChange={handleChange} />);
    const slider = screen.getByRole("slider");
    
    // Fire change event instead of userEvent type for range slider compatibility
    fireEvent.change(slider, { target: { value: "300" } });
    expect(handleChange).toHaveBeenCalledWith(300);
  });
});
