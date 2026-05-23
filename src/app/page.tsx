"use client";

import { useRef, useState } from "react";
import Nav from "./(marketing)/_components/nav";
import Hero from "./(marketing)/_components/hero";
import Problem from "./(marketing)/_components/problem";
import Product from "./(marketing)/_components/product";
import Suppliers from "./(marketing)/_components/suppliers";
import Agents from "./(marketing)/_components/agents";
import HowItWorks from "./(marketing)/_components/how-it-works";
import Trust from "./(marketing)/_components/trust";
import CTAForm from "./(marketing)/_components/cta-form";
import Footer from "./(marketing)/_components/footer";

type Role = "agent" | "supplier" | "buyer";

export default function LandingPage() {
  const [preselectedRole, setPreselectedRole] = useState<Role | "">("");
  const ctaRef = useRef<HTMLDivElement>(null);

  function scrollToCTA(role?: Role) {
    if (role) setPreselectedRole(role);
    ctaRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="antialiased">
      <Nav onDemoClick={() => scrollToCTA()} />
      <Hero onDemoClick={() => scrollToCTA()} />
      <Problem />
      <Product />
      <Suppliers onJoin={() => scrollToCTA("supplier")} />
      <Agents onJoin={() => scrollToCTA("agent")} />
      <HowItWorks />
      <Trust />
      <div ref={ctaRef}>
        <CTAForm preselectedRole={preselectedRole} />
      </div>
      <Footer />
    </div>
  );
}
