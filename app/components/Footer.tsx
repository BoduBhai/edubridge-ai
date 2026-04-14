import BrandLogo from "./BrandLogo";

const NAV_LINKS = [
  { name: "Privacy Policy", href: "#" },
  { name: "Terms  Conditions", href: "#" },
  { name: "Contact Us", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-foreground-200 mt-auto border-t">
      <div className="m-auto flex max-w-7xl items-center justify-between p-5">
        <BrandLogo />
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
        <div className="text-muted-foreground">&copy; 2026 Edubrige Ai</div>
      </div>
    </footer>
  );
}
