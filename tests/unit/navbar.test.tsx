import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Navbar } from "@/components/layout/navbar";

vi.mock("@/hooks/use-auth", () => ({
  useAuth: () => ({
    isAuthenticated: false,
    loading: false,
    session: null,
    user: null,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  it("renders the brand name", () => {
    renderNavbar();
    expect(screen.getByText("Nexreff")).toBeTruthy();
  });

  it("renders navigation links", () => {
    renderNavbar();
    expect(screen.getByText("Photography")).toBeTruthy();
    expect(screen.getByText("Art")).toBeTruthy();
    expect(screen.getByText("Guitar")).toBeTruthy();
    expect(screen.getByText("Videos")).toBeTruthy();
    expect(screen.getByText("Journal")).toBeTruthy();
    expect(screen.getByText("Projects")).toBeTruthy();
    expect(screen.getByText("Collections")).toBeTruthy();
    expect(screen.getByText("About")).toBeTruthy();
  });

  it("has a mobile menu button", () => {
    renderNavbar();
    const button = screen.getByLabelText(/menu/i);
    expect(button).toBeTruthy();
  });
});
