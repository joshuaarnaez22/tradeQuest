"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { HowItWorks } from "@/components/HowItWorks";
import { DailyLoop } from "@/components/DailyLoop";
import { WhyNotGambling } from "@/components/WhyNotGambling";
import { Waitlist } from "@/components/Waitlist";
import { Footer } from "@/components/Footer";

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  return (
    <div
      data-theme={theme}
      style={{
        fontFamily: "var(--font-sans)",
        background: "var(--surface-page)",
        color: "var(--text-primary)",
        overflowX: "hidden",
      }}
    >
      <Nav theme={theme} onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))} />
      <Hero />
      <Marquee />
      <HowItWorks />
      <DailyLoop />
      <WhyNotGambling />
      <Waitlist />
      <Footer />
    </div>
  );
}
