"use client";

import { useState, useEffect } from "react";

export default function TestPage() {
  const [theme, setTheme] = useState<"light" | "dark" | "navy">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const html = document.documentElement;
    
    if (theme === "light") {
      html.classList.remove("dark");
      html.removeAttribute("data-theme");
      html.style.colorScheme = "light";
    } else if (theme === "dark") {
      html.classList.add("dark");
      html.removeAttribute("data-theme");
      html.style.colorScheme = "dark";
    } else if (theme === "navy") {
      html.classList.add("dark");
      html.setAttribute("data-theme", "navy");
      html.style.colorScheme = "dark";
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Theme Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2 bg-card p-4 rounded-lg border border-border shadow-lg">
        <button
          onClick={() => setTheme("light")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            theme === "light"
              ? "bg-navy text-navy-foreground shadow-md"
              : "bg-muted text-foreground hover:bg-border"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setTheme("dark")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            theme === "dark"
              ? "bg-navy text-navy-foreground shadow-md"
              : "bg-muted text-foreground hover:bg-border"
          }`}
        >
          Dark
        </button>
        <button
          onClick={() => setTheme("navy")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            theme === "navy"
              ? "bg-navy text-navy-foreground shadow-md"
              : "bg-muted text-foreground hover:bg-border"
          }`}
        >
          Navy
        </button>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <section>
          <h1 className="text-4xl font-bold mb-6 text-navy">Theme Test Page</h1>
          <p className="text-lg text-muted-foreground mb-4">
            Current Theme: <span className="font-bold text-navy">{theme}</span>
          </p>
        </section>

        {/* Color Palette Grid */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-navy">Color Palette</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Background */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-background rounded mb-3 border border-border"></div>
              <p className="font-mono text-sm text-muted-foreground">background</p>
            </div>

            {/* Foreground */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-foreground rounded mb-3"></div>
              <p className="font-mono text-sm text-muted-foreground">foreground</p>
            </div>

            {/* Card */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-card rounded mb-3 border border-border"></div>
              <p className="font-mono text-sm text-muted-foreground">card</p>
            </div>

            {/* Navy */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-navy rounded mb-3"></div>
              <p className="font-mono text-sm text-muted-foreground">navy</p>
            </div>

            {/* Secondary */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-secondary rounded mb-3 border border-border"></div>
              <p className="font-mono text-sm text-muted-foreground">secondary</p>
            </div>

            {/* Muted */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-muted rounded mb-3"></div>
              <p className="font-mono text-sm text-muted-foreground">muted</p>
            </div>

            {/* Accent */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-accent rounded mb-3"></div>
              <p className="font-mono text-sm text-muted-foreground">accent</p>
            </div>

            {/* Border */}
            <div className="p-4 rounded-lg border border-border">
              <div className="w-full h-24 bg-border rounded mb-3"></div>
              <p className="font-mono text-sm text-muted-foreground">border</p>
            </div>
          </div>
        </section>

        {/* Text Styles */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-navy">Text Styles</h2>
          <div className="space-y-4">
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-foreground">Foreground text (default)</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-muted-foreground">Muted foreground text</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-navy font-bold">Navy text (emphasis)</p>
            </div>
            <div className="p-4 bg-card rounded-lg border border-border">
              <p className="text-accent-foreground">Accent foreground text</p>
            </div>
          </div>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-navy">Components</h2>
          <div className="space-y-4">
            {/* Buttons */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="px-6 py-2 bg-navy text-navy-foreground rounded-lg font-medium hover:opacity-90 transition">
                  Primary Button
                </button>
                <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:opacity-90 transition border border-border">
                  Secondary Button
                </button>
                <button className="px-6 py-2 bg-accent text-accent-foreground rounded-lg font-medium hover:opacity-90 transition">
                  Accent Button
                </button>
                <button className="px-6 py-2 bg-muted text-muted-foreground rounded-lg font-medium hover:opacity-90 transition border border-border">
                  Muted Button
                </button>
              </div>
            </div>

            {/* Cards */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
                  <h4 className="font-bold text-navy mb-2">Card Title</h4>
                  <p className="text-muted-foreground text-sm">This is a card with navy title and muted text.</p>
                </div>
                <div className="p-6 bg-card border border-border rounded-lg shadow-sm">
                  <h4 className="font-bold text-accent-foreground mb-2">Accent Card</h4>
                  <p className="text-muted-foreground text-sm">This card uses accent color for the title.</p>
                </div>
                <div className="glass-effect p-6 rounded-lg">
                  <h4 className="font-bold text-navy mb-2">Glass Effect</h4>
                  <p className="text-muted-foreground text-sm">This uses the glass-effect class.</p>
                </div>
              </div>
            </div>

            {/* Form Inputs */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Form Elements</h3>
              <div className="space-y-3 max-w-md">
                <input
                  type="text"
                  placeholder="Text input"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <input
                  type="email"
                  placeholder="Email input"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
                />
                <textarea
                  placeholder="Textarea"
                  className="w-full px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-navy"
                  rows={3}
                ></textarea>
              </div>
            </div>

            {/* Hero Gradient */}
            <div>
              <h3 className="text-lg font-bold mb-3 text-foreground">Hero Gradient</h3>
              <div className="hero-gradient p-12 rounded-lg text-center">
                <h4 className="text-2xl font-bold text-navy mb-2">Hero Section</h4>
                <p className="text-foreground">This uses the hero-gradient class</p>
              </div>
            </div>
          </div>
        </section>

        {/* CSS Variables Debug */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-navy">CSS Variables (Debug)</h2>
          <div className="bg-card border border-border rounded-lg p-6 overflow-x-auto">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-navy">Variable</th>
                  <th className="text-left py-2 text-navy">Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "--background",
                  "--foreground",
                  "--card",
                  "--card-foreground",
                  "--navy",
                  "--navy-foreground",
                  "--secondary",
                  "--muted",
                  "--muted-foreground",
                  "--accent",
                  "--accent-foreground",
                  "--border",
                  "--input",
                  "--ring",
                ].map((varName) => (
                  <tr key={varName} className="border-b border-border">
                    <td className="py-2 text-navy">{varName}</td>
                    <td className="py-2 text-foreground">
                      {typeof window !== "undefined"
                        ? getComputedStyle(document.documentElement)
                            .getPropertyValue(varName)
                            .trim()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Spacing & Layout */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-navy">Spacing & Layout</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-16 h-16 bg-navy rounded-lg flex items-center justify-center text-navy-foreground font-mono text-xs">
                gap-4
              </div>
              <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-accent-foreground font-mono text-xs">
                items
              </div>
              <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center text-secondary-foreground font-mono text-xs">
                center
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-border pt-8 mt-12">
          <p className="text-center text-muted-foreground">
            Test page for theme system • Current mode: <span className="text-navy font-bold">{theme}</span>
          </p>
        </section>
      </div>
    </div>
  );
}
