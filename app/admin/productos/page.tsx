"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Plus,
  Search,
  Pencil,
  ToggleLeft,
  ToggleRight,
  TriangleAlert,
  Loader2,
} from "lucide-react";

interface ProductRow {
  id: string;
  sku: string;
  name: string;
  category: string;
  price_per_bag_cop: number;
  is_active: boolean;
  updated_at: string;
  co2_per_kg: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  structural: "Estructural",
  plaster: "Pañete / Revoque",
  specialty: "Especialidad",
};

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function isPriceStale(updatedAt: string): boolean {
  const updated = new Date(updatedAt).getTime();
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return now - updated > thirtyDays;
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active
          ? "bg-ultracem-green/10 text-ultracem-green"
          : "bg-ultracem-gray-100 text-ultracem-gray-600"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-ultracem-green" : "bg-ultracem-gray-600"
        }`}
      />
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}

export default function ProductosPage() {
  const searchParams = useSearchParams();
  const showStaleOnly = searchParams.get("stale") === "true";
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "error";
    message: string;
  } | null>(null);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(
            result.error?.message || "Error al cargar productos."
          );
        }

        setProducts(result.data);
      } catch (err) {
        setFetchError(
          err instanceof Error ? err.message : "Error al cargar productos."
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        !categoryFilter || p.category === categoryFilter;
      const matchesStale = !showStaleOnly || isPriceStale(p.updated_at);

      return matchesSearch && matchesCategory && matchesStale;
    });
  }, [products, search, categoryFilter, showStaleOnly]);

  const handleToggleActive = async (product: ProductRow) => {
    setTogglingId(product.id);
    setNotification(null);

    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Error al cambiar estado."
        );
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, is_active: !p.is_active } : p
        )
      );
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Error al cambiar el estado del producto.",
      });
    } finally {
      setTogglingId(null);
    }
  };

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return Array.from(set);
  }, [products]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-ultracem-blue" />
          <span className="ml-3 text-sm text-ultracem-gray-600">
            Cargando productos...
          </span>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-sm text-ultracem-gray-600">{fetchError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn-outline mt-4"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-ultracem-gray-900">
          {showStaleOnly ? "Productos con precios desactualizados" : "Productos"}
        </h1>
        <Link href="/admin/productos/nuevo" className="btn-primary inline-flex items-center gap-2 self-start">
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Link>
      </div>

      {notification && (
        <div className="mb-6 flex items-center gap-3 rounded-uc-input border border-ultracem-error bg-ultracem-error/5 px-4 py-3 text-sm text-ultracem-error">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ultracem-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="input-uc pl-10"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="input-uc min-w-[180px] appearance-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat] || cat}
            </option>
          ))}
        </select>
        {showStaleOnly && (
          <Link
            href="/admin/productos"
            className="btn-outline inline-flex items-center justify-center"
          >
            Ver todos
          </Link>
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface py-16 shadow-uc-card">
          <p className="text-sm text-ultracem-gray-600">
            {search || categoryFilter
              ? "No se encontraron productos con los filtros actuales."
              : showStaleOnly
                ? "No hay productos con precios desactualizados."
              : "No hay productos registrados."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface shadow-uc-card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ultracem-gray-100 bg-ultracem-surface-subtle">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  SKU
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  Nombre
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  Categoría
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  Precio
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  Estado
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ultracem-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const stale = isPriceStale(product.updated_at);

                return (
                  <tr
                    key={product.id}
                    className="border-b border-ultracem-gray-100 last:border-0"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-ultracem-gray-900">
                      <div className="flex items-center gap-2">
                        {stale && (
                          <TriangleAlert className="h-4 w-4 shrink-0 text-ultracem-yellow" />
                        )}
                        {product.sku}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ultracem-gray-900">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-ultracem-gray-600">
                      {CATEGORY_LABELS[product.category] || product.category}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-ultracem-gray-900">
                      {formatCOP(product.price_per_bag_cop)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge active={product.is_active} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/productos/${product.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-ultracem-gray-100 px-2.5 py-1.5 text-xs font-medium text-ultracem-gray-600 transition-colors hover:border-ultracem-blue hover:text-ultracem-blue"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleToggleActive(product)}
                          disabled={togglingId === product.id}
                          className="inline-flex items-center gap-1 rounded-lg border border-ultracem-gray-100 px-2.5 py-1.5 text-xs font-medium text-ultracem-gray-600 transition-colors hover:border-ultracem-gray-600 disabled:opacity-50"
                          title={
                            product.is_active
                              ? "Desactivar producto"
                              : "Activar producto"
                          }
                        >
                          {togglingId === product.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : product.is_active ? (
                            <ToggleRight className="h-3.5 w-3.5 text-ultracem-green" />
                          ) : (
                            <ToggleLeft className="h-3.5 w-3.5 text-ultracem-gray-600" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
