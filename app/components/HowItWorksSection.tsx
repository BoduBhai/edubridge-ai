import type { LucideIcon } from "lucide-react";
import { BookOpenText, Globe2, HeartHandshake } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Pillar = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const PILLARS: Pillar[] = [
  {
    title: "Financial Reality First",
    description:
      "We calculate your Expected Family Contribution (EFC) and only recommend schools with a history of meeting financial need for international students.",
    icon: HeartHandshake,
  },
  {
    title: "Holistic Profile Matching",
    description:
      "Your GPA is just one piece. We look at your curriculum context, extracurriculars, and narrative to find places where you'll stand out.",
    icon: BookOpenText,
  },
  {
    title: "Context-Aware Advice",
    description:
      "Coming from a national curriculum rather than IB/AP? Our AI understands international grading systems and helps you translate your achievements.",
    icon: Globe2,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-[#f5f1ea] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl leading-tight tracking-tight sm:text-5xl">
            More than a search engine.
            <br />A dedicated advisor.
          </h2>
          <p className="text-muted-foreground mt-4 text-base leading-relaxed sm:text-lg">
            Most study abroad tools give you a list of 4,000 colleges. We give
            you a realistic, tailored strategy based on your unique background
            and finances.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {PILLARS.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <Card
                key={pillar.title}
                className="bg-background/90 h-full rounded-3xl border py-6 shadow-sm"
              >
                <CardHeader className="space-y-5 px-6">
                  <div className="bg-muted text-primary flex size-10 items-center justify-center rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-2xl font-semibold tracking-tight">
                    {pillar.title}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {pillar.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
