import Link from "next/link";
import { getAdminDashboardStats } from "@/domains/admin";
import { prisma } from "@/lib/prisma";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export default async function AdminDashboard() {
  const stats = await getAdminDashboardStats(prisma);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-8 text-2xl font-semibold text-ultracem-gray-900">
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
          <p className="text-sm font-medium text-ultracem-gray-600">
            Total de productos activos
          </p>
          <p className="mt-2 text-display font-bold text-ultracem-blue">
            {formatNumber(stats.activeProductsCount)}
          </p>
        </div>
        <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
          <p className="text-sm font-medium text-ultracem-gray-600">
            Total de cálculos realizados
          </p>
          <p className="mt-2 text-display font-bold text-ultracem-blue">
            {formatNumber(stats.totalCalculationsCount)}
          </p>
        </div>
        <Link
          href="/admin/productos?stale=true"
          className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card transition-colors hover:border-ultracem-yellow"
        >
          <p className="text-sm font-medium text-ultracem-gray-600">
            Productos con precios desactualizados
          </p>
          <p className="mt-2 text-display font-bold text-ultracem-yellow">
            {formatNumber(stats.staleProductsCount)}
          </p>
        </Link>
      </div>

      <section className="mt-8 rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-h3 text-ultracem-gray-900">
              Precios por revisar
            </h2>
            <p className="mt-1 text-body-sm text-ultracem-gray-600">
              Productos activos sin actualización de precio en más de 30 días.
            </p>
          </div>
          <Link href="/admin/productos?stale=true" className="btn-outline self-start">
            Ver productos
          </Link>
        </div>

        {stats.staleProducts.length === 0 ? (
          <p className="mt-6 text-body-sm text-ultracem-gray-600">
            Todos los precios activos están actualizados.
          </p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead>
                <tr className="border-b border-ultracem-gray-100 text-caption font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Última actualización</th>
                </tr>
              </thead>
              <tbody>
                {stats.staleProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-ultracem-gray-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ultracem-gray-900">
                      {product.sku}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ultracem-gray-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-600">
                      {formatCOP(product.price_per_bag_cop)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-600">
                      {formatDate(product.updated_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
