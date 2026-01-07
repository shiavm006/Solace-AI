import { Hero } from "@/components/ui/helix-hero";

export default function DemoOne() {
  return (
    <Hero
      title="Resonance in Motion"
      description={
        "A silent rhythm spirals endlessly through empty space—\n" +
        "light refracts, forms bend, and geometry hums in quiet harmony.\n" +
        "Beyond shape and color, there is only fluid movement."
      }
    />
  );
}

import MinimalHero from "@/components/ui/hero-minimalism";

export default function DemoOne() {
  return <MinimalHero />;
}

