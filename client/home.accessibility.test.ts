// @vitest-environment happy-dom
import { readFileSync } from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/trpc", () => ({
  trpc: {
    webKlip: { search: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
    partnerships: { submit: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) } },
  },
}));

import Home from "./src/pages/Home";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const homeSource = readFileSync(path.join(process.cwd(), "client/src/pages/Home.tsx"), "utf8");
const styleSource = readFileSync(path.join(process.cwd(), "client/src/index.css"), "utf8");
const signalStyleSource = readFileSync(path.join(process.cwd(), "client/src/styles/webklip-result.css"), "utf8");

function contrastRatio(first: string, second: string) {
  const luminance = (hex: string) => {
    const values = hex.slice(1).match(/.{2}/g)?.map((value) => parseInt(value, 16) / 255) ?? [];
    const [red, green, blue] = values.map((value) => value <= .03928 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * red + .7152 * green + .0722 * blue;
  };
  const [lighter, darker] = [luminance(first), luminance(second)].sort((left, right) => right - left);
  return (lighter + .05) / (darker + .05);
}

let root: Root | undefined;
let container: HTMLDivElement | undefined;

beforeEach(() => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root?.unmount());
  container?.remove();
  root = undefined;
  container = undefined;
});

describe("Klipza Studio accessibility baseline", () => {
  it("mantém landmarks, rótulos de navegação e controles nomeados", () => {
    expect(homeSource).toContain("<main className=\"studio-shell\" data-reduced-motion=");
    expect(homeSource).toContain("<header className=\"studio-nav\">");
    expect(homeSource).toContain("aria-label=\"Navegação principal\"");
    expect(homeSource).toContain("aria-label=\"Pesquisar no Web.Klip\"");
    expect(homeSource).toContain("aria-live=\"polite\"");
  });

  it("renderiza landmarks e nomes acessíveis no DOM público", () => {
    const html = renderToStaticMarkup(createElement(Home));

    expect(html).toContain("<main");
    expect(html).toContain("<header");
    expect(html).toContain("aria-label=\"Navegação principal\"");
    expect(html).toContain("aria-label=\"Pesquisar no Web.Klip\"");
    expect(html).toContain("aria-label=\"Ir para o início\"");
    expect(html).toContain("role=\"tablist\"");
  });

  it("mantém controles focáveis por teclado na experiência renderizada", async () => {
    await act(async () => root?.render(createElement(Home)));
    const control = container?.querySelector<HTMLButtonElement>(".brand-lockup");

    expect(control).toBeTruthy();
    control?.focus();
    expect(document.activeElement).toBe(control);
    expect(control?.matches(":focus-visible")).toBe(true);
  });

  it("reflete a preferência de reduzir movimento na interface renderizada", async () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    await act(async () => root?.render(createElement(Home)));

    expect(container?.querySelector("main")?.getAttribute("data-reduced-motion")).toBe("true");
  });

  it("preserva foco visível e fallback de redução de movimento", () => {
    expect(styleSource).toContain("button:focus-visible");
    expect(styleSource).toContain("@media (prefers-reduced-motion: reduce)");
    expect(signalStyleSource).toContain(".hidden-signal:focus-visible");
    expect(signalStyleSource).toContain(".scroll-telemetry { display: none; }");
  });

  it("declara e comprova contraste alto para os campos principais", () => {
    expect(styleSource).toContain("--ink: #080a0d");
    expect(styleSource).toContain("--warm-white: #fbfaf7");
    expect(styleSource).toContain("--acid: #84edff");
    expect(styleSource).toContain("background: var(--ink); color: var(--warm-white)");
    expect(contrastRatio("#080a0d", "#fbfaf7")).toBeGreaterThan(7);
    expect(contrastRatio("#080a0d", "#84edff")).toBeGreaterThan(7);
  });
});
