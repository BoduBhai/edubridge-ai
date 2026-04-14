import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function FinalCtaSection() {
  return (
    <section className="py-14 sm:py-20">
      <Card className="from-primary to-primary/85 text-primary-foreground overflow-hidden rounded-[2rem] border-0 bg-linear-to-r py-0 shadow-xl">
        <CardContent className="px-6 py-14 sm:px-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-4xl leading-tight tracking-tight sm:text-6xl">
              Your future is waiting.
            </h2>
            <p className="text-primary-foreground/85 mt-4 text-lg leading-relaxed sm:text-xl">
              Create your free profile today to get your personalized university
              matches, scholarship recommendations, and AI advising.
            </p>

            <Button
              asChild
              size="lg"
              variant="secondary"
              className="bg-background text-primary hover:bg-background/90 mt-8 h-12 rounded-full px-8"
            >
              <Link href="/sign-up">Create Free Profile</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
