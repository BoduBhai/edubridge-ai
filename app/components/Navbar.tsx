"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Menu, X } from "lucide-react";
import BrandLogo from "./BrandLogo";
import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import Link from "next/link";

const NAV_LINKS = [
  { name: "How it works", href: "#how-it-works" },
  { name: "Scholarships", href: "" },
  { name: "Student Stories", href: "#student-stories" },
  { name: "For Counselors", href: "#" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  return (
    <header className="bg-background sticky top-0 z-50 flex min-h-[10vh] flex-col justify-center border-b px-4 sm:px-6 lg:px-8">
      <nav className="bg-background relative z-50 font-serif">
        <div className="m-auto flex max-w-7xl justify-between">
          {/* Nav Logo */}
          <BrandLogo />

          {/* Desktop Navigation Links */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Desktop Buttons */}
          <div className="hidden cursor-pointer items-center gap-2 md:flex">
            <Show when="signed-in">
              <Button asChild variant={"default"} size={"lg"}>
                <Link href="/dashboard" className="cursor-pointer">
                  Dashboard <ChevronRight />
                </Link>
              </Button>
            </Show>

            <Show when="signed-out">
              <SignInButton>
                <Button variant={"ghost"} className="cursor-pointer">
                  Log in
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button variant={"default"} className="cursor-pointer">
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </nav>
      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="bg-background absolute top-full left-0 z-40 flex w-full flex-col gap-4 border-b border-gray-200 p-5 shadow-lg md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-foreground hover:bg-muted rounded-md px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className="border-foreground-100 flex flex-col gap-3 border-t pt-4">
            <Show when="signed-in">
              <Button asChild variant={"default"} size={"lg"}>
                <Link href="/dashboard" className="cursor-pointer">
                  Dashboard <ChevronRight />
                </Link>
              </Button>
            </Show>

            <Show when="signed-out">
              <SignInButton>
                <Button variant={"ghost"} className="cursor-pointer">
                  Log in
                </Button>
              </SignInButton>

              <SignUpButton>
                <Button variant={"default"} className="cursor-pointer">
                  Get Started
                </Button>
              </SignUpButton>
            </Show>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
