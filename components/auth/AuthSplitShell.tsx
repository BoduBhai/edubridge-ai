import type { ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import BrandLogo from "@/components/BrandLogo";

type LeftMetric = {
  value: string;
  label: string;
};

type LeftTestimonial = {
  quote: string;
  author: string;
  meta: string;
  avatarSrc: string;
  avatarFallback: string;
};

type LeftCommunity = {
  text: string;
  avatars: Array<{
    src: string;
    alt: string;
    fallback: string;
  }>;
};

type AuthSplitShellProps = {
  heading: string;
  subheading: string;
  leftTitle?: string;
  leftSubtitle?: string;
  checklist?: string[];
  testimonial?: LeftTestimonial;
  metrics?: LeftMetric[];
  community?: LeftCommunity;
  children: ReactNode;
};

export default function AuthSplitShell({
  heading,
  subheading,
  leftTitle,
  leftSubtitle,
  checklist,
  testimonial,
  metrics,
  community,
  children,
}: AuthSplitShellProps) {
  return (
    <main className="bg-background min-h-screen">
      <div className="grid min-h-screen w-full overflow-hidden md:grid-cols-2">
        <aside className="relative hidden border-r bg-linear-to-br from-[#0d4f35] to-[#1f724d] p-8 text-white md:grid md:grid-rows-[auto_1fr_auto] lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_80%,rgba(255,255,255,0.16),transparent_46%)]" />

          <div className="relative z-10">
            <BrandLogo size="md" tone="light" />
          </div>

          <div className="relative z-10 flex items-center py-8 lg:py-10">
            <div className="w-full space-y-6">
              {leftTitle ? (
                <h2 className="max-w-md font-serif text-4xl leading-tight text-white lg:text-5xl">
                  {leftTitle}
                </h2>
              ) : null}

              {leftSubtitle ? (
                <p className="max-w-md text-sm leading-relaxed text-white/80 lg:text-base">
                  {leftSubtitle}
                </p>
              ) : null}

              {checklist?.length ? (
                <ul className="space-y-3">
                  {checklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-white/90 lg:text-base"
                    >
                      <CheckCircle2
                        className="mt-0.5 size-4 shrink-0 text-emerald-200"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {testimonial ? (
                <div className="space-y-5">
                  <blockquote className="font-serif text-3xl leading-snug text-white lg:text-4xl">
                    {testimonial.quote}
                  </blockquote>

                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarImage
                        src={testimonial.avatarSrc}
                        alt={testimonial.author}
                      />
                      <AvatarFallback>
                        {testimonial.avatarFallback}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold text-emerald-100">
                        {testimonial.author}
                      </p>
                      <p className="text-xs text-white/70">
                        {testimonial.meta}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="relative z-10 space-y-5">
            {metrics?.length ? (
              <div className="grid grid-cols-3 gap-4 border-t border-white/20 pt-5">
                {metrics.map((metric) => (
                  <div key={metric.label}>
                    <p className="text-2xl font-semibold text-amber-200 lg:text-3xl">
                      {metric.value}
                    </p>
                    <p className="text-xs text-white/75">{metric.label}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {community ? (
              <div className="flex items-center gap-3">
                <AvatarGroup>
                  {community.avatars.map((avatar) => (
                    <Avatar key={avatar.src} className="size-7">
                      <AvatarImage src={avatar.src} alt={avatar.alt} />
                      <AvatarFallback>{avatar.fallback}</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <p className="max-w-55 text-xs leading-tight text-white/85">
                  {community.text}
                </p>
              </div>
            ) : null}
          </div>
        </aside>

        <section className="relative flex items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
          <div className="w-full max-w-102.5">
            <header className="mb-6">
              <h1 className="text-foreground font-serif text-4xl leading-tight tracking-tight">
                {heading}
              </h1>
              <p className="text-muted-foreground mt-2 text-sm">{subheading}</p>
            </header>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
