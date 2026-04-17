import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroSection() {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[1fr_1.05fr] md:gap-8 lg:gap-14">
        <div className="order-2 space-y-7 md:order-1">
          <p className="text-primary bg-primary/10 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
            <Globe2 className="size-4" aria-hidden="true" />
            Your pathway to US universities
          </p>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Study in the US.
              <br />
              <span className="text-primary/80">We&apos;ll help you</span> find
              the way.
            </h1>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
              An AI advisor built specifically for international students.
              Discover universities that match your profile, find realistic
              scholarships, and navigate the application process with
              confidence.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full px-7 text-sm"
            >
              <Link href="/sign-up" className="inline-flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-7 text-sm"
            >
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2"
              >
                <Play className="size-4" aria-hidden="true" />
                See how it works
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-4 pt-1">
            <div className="flex -space-x-2">
              {[
                {
                  src: "/avatars/student-1.jpg",
                  alt: "Student admitted to a US university",
                },
                {
                  src: "/avatars/student-2.jpg",
                  alt: "International student profile",
                },
                {
                  src: "/avatars/student-3.jpg",
                  alt: "Future graduate student",
                },
                {
                  src: "/avatars/student-4.jpg",
                  alt: "Student success story",
                },
              ].map((avatar) => (
                <div
                  key={avatar.src}
                  className="ring-background relative size-9 overflow-hidden rounded-full ring-2"
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.alt}
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Join{" "}
              <span className="text-foreground font-semibold">10,000+</span>{" "}
              students already admitted
            </p>
          </div>
        </div>

        <div className="relative order-1 mx-auto w-full max-w-160 md:order-2 md:mx-0">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/40 shadow-2xl">
            <Image
              src="/hero-students.png"
              alt="International students reviewing university options together"
              width={960}
              height={1100}
              priority
              className="h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
