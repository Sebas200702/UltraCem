"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { UltraCemLogo } from "@/components/brand";
import { Button } from "@/components/ui";
import { navItems } from "@/components/landing/landing-nav/landing-nav-data";
import { type NavItem } from "@/components/landing/landing-nav/landing-nav-types";

function NavLink({
  item,
  onClick,
  className,
}: {
  item: NavItem;
  onClick?: () => void;
  className: string;
}) {
  const underline = (
    <span className="absolute inset-x-3 bottom-0 h-px origin-left scale-x-0 bg-ultracem-yellow transition-transform group-hover:scale-x-100" />
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className={className}
      >
        {item.label}
        {underline}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onClick} className={className}>
      {item.label}
      {underline}
    </Link>
  );
}

export function LandingNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between bg-ultracem-blue px-4 shadow-uc-card md:px-6">
        <Link
          href="/"
          onClick={close}
          className="flex shrink-0 items-center"
          aria-label="UltraCem inicio"
        >
          <UltraCemLogo variant="light" priority className="h-10 w-auto md:h-12" />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              item={item}
              className="group relative px-3 py-1.5 text-body-sm font-medium text-white/75 transition-colors hover:text-white"
            />
          ))}
          <Button
            href="/chat"
            variant="secondary"
            className="ml-2 min-h-10 px-5 py-2"
          >
            Abrir chat
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center rounded-uc-button text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? (
            <X className="h-5 w-5" strokeWidth={2.2} />
          ) : (
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          )}
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <button
            type="button"
            onClick={close}
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-ultracem-blue-dark/60 backdrop-blur-sm"
          />
          <div className="relative bg-ultracem-blue px-4 pb-6 pt-2 shadow-uc-modal animate-fade-in-up">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <NavLink
                    item={item}
                    onClick={close}
                    className="group relative flex items-center justify-between rounded-uc-button px-3 py-3 text-body font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-white/10 pt-4">
              <Button
                href="/chat"
                variant="secondary"
                className="w-full justify-center"
                onClick={close}
              >
                Abrir chat con Vanesa
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
