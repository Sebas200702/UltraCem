import Link from "next/link";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-ultracem-surface-muted">
      <header className="border-b border-ultracem-blue-dark bg-ultracem-blue">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link
            href="/admin"
            className="font-display text-2xl tracking-wide text-white"
          >
            ULTRACEM ADMIN
          </Link>
          <nav className="flex gap-6">
            <Link
              href="/admin"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/productos"
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Productos
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
