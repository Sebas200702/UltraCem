import Link from "next/link";
import { getOptionalAdminUser } from "@/lib/auth-guard";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const admin = await getOptionalAdminUser();

  return (
    <div className="min-h-screen bg-ultracem-surface-muted">
      <header className="border-b border-ultracem-blue-dark bg-ultracem-blue">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          <Link
            href="/admin"
            className="text-h2 font-bold tracking-wide text-white"
          >
            ULTRACEM ADMIN
          </Link>
          <nav className="flex items-center gap-6">
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
            {admin && (
              <>
                <span className="hidden text-xs text-white/70 md:inline">
                  {admin.email}
                </span>
                <form action="/admin/logout" method="post">
                  <button
                    type="submit"
                    className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                  >
                    Salir
                  </button>
                </form>
              </>
            )}
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
