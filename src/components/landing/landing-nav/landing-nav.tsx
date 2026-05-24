import Link from "next/link";
import { UltraCemLogo } from "@/components/brand";
import { Button } from "@/components/ui";
import { navItems } from '@/components/landing/landing-nav/landing-nav-data';

export function LandingNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-ultracem-blue px-6 shadow-uc-card">
      <Link href="/" className="flex shrink-0 items-center">
        <UltraCemLogo variant="light" priority className="h-12 w-auto" />
      </Link>
      <div className="flex items-center gap-2">
        {navItems.map((item) => {
          const className = `group relative hidden px-3 py-1.5 text-body-sm font-medium text-white/75 transition-colors hover:text-white ${item.className}`;
          const underline = (
            <span className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-ultracem-yellow transition-transform group-hover:scale-x-100" />
          );

          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {item.label}
                {underline}
              </a>
            );
          }

          return (
            <Link key={item.label} href={item.href} className={className}>
              {item.label}
              {underline}
            </Link>
          );
        })}
        <Button href="/chat" variant="secondary" className="min-h-10 px-5 py-2">
          Abrir chat
        </Button>
      </div>
    </nav>
  );
}
