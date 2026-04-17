import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  size?: "sm" | "md";
  tone?: "default" | "light";
  href?: string;
};

const SIZE_STYLES = {
  sm: {
    container: "gap-1.5",
    icon: "size-4",
    text: "text-sm",
    aiSpacing: "ml-1",
    stroke: 1.8,
  },
  md: {
    container: "gap-2",
    icon: "size-7",
    text: "text-xl",
    aiSpacing: "ml-1.5",
    stroke: 1.5,
  },
} as const;

export default function BrandLogo({
  className,
  size = "md",
  tone = "default",
  href = "/",
}: BrandLogoProps) {
  const styles = SIZE_STYLES[size];

  const logoContent = (
    <>
      <div className={cn(tone === "light" ? "text-white" : "text-primary")}>
        <GraduationCap className={styles.icon} strokeWidth={styles.stroke} />
      </div>

      <div className={cn("flex items-center tracking-tight", styles.text)}>
        <span
          className={cn(
            "font-bold",
            tone === "light" ? "text-white" : "text-primary",
          )}
        >
          EduBridge
        </span>
        <span
          className={cn(
            styles.aiSpacing,
            "font-semibold",
            tone === "light" ? "text-[#cd9952]" : "text-foreground",
          )}
        >
          AI
        </span>
      </div>
    </>
  );

  return (
    <Link
      href={href}
      aria-label="Go to home page"
      className={cn(
        "flex items-center select-none",
        styles.container,
        className,
      )}
    >
      {logoContent}
    </Link>
  );
}
