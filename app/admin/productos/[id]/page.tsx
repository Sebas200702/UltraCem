"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";
import {
  PriceHistoryTable,
  type PriceHistoryEntry,
} from "@/components/admin/price-history-table";

interface ProductDetail {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string | null;
  technical_specs: Record<string, unknown>;
  price_per_bag_cop: number;
  co2_per_kg: number;
  datasheet_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function EditarProductoPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(
            result.error?.message || "Error al cargar el producto."
          );
        }

        setProduct(result.data);
      } catch (err) {
        setProductError(
          err instanceof Error ? err.message : "Error al cargar el producto."
        );
      } finally {
        setIsLoadingProduct(false);
      }
    }

    async function loadPriceHistory() {
      try {
        const res = await fetch(`/api/products/${id}/price-history`);
        const result = await res.json();

        if (res.ok && result.success) {
          setPriceHistory(
            result.data.map((entry: PriceHistoryEntry) => ({
              ...entry,
              old_price: entry.old_price !== null ? Number(entry.old_price) : null,
              new_price: Number(entry.new_price),
            }))
          );
        }
      } catch {
        // Silently fail — price history is secondary
      } finally {
        setIsLoadingHistory(false);
      }
    }

    loadProduct();
    loadPriceHistory();
  }, [id]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Error al guardar el producto."
        );
      }

      setNotification({
        type: "success",
        message: "Producto actualizado exitosamente.",
      });

      setTimeout(() => {
        router.push("/admin/productos");
      }, 1200);
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Error al guardar el producto.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(
          result.error?.message || "Error al desactivar el producto."
        );
      }

      router.push("/admin/productos");
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error al desactivar el producto.",
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ultracem-blue border-t-transparent" />
          <span className="ml-3 text-sm text-ultracem-gray-600">
            Cargando producto...
          </span>
        </div>
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
        <Link
          href="/admin/productos"
          className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ultracem-gray-600 transition-colors hover:text-ultracem-blue"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a productos
        </Link>

        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="mb-3 h-10 w-10 text-ultracem-error" />
          <p className="text-sm text-ultracem-gray-600">
            {productError || "Producto no encontrado."}
          </p>
        </div>
      </div>
    );
  }

  const initialFormData: ProductFormData = {
    sku: product.sku,
    name: product.name,
    category: product.category as ProductFormData["category"],
    subcategory: product.subcategory ?? "",
    technical_specs: JSON.stringify(product.technical_specs, null, 2),
    price_per_bag_cop: product.price_per_bag_cop,
    co2_per_kg: product.co2_per_kg,
    datasheet_url: product.datasheet_url ?? "",
    is_active: product.is_active,
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
      <Link
        href="/admin/productos"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ultracem-gray-600 transition-colors hover:text-ultracem-blue"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a productos
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ultracem-gray-900">
          Editar producto
        </h1>

        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-uc-button border border-ultracem-error px-4 py-2 text-sm font-medium text-ultracem-error transition-colors hover:bg-ultracem-error hover:text-white"
        >
          <Trash2 className="h-4 w-4" />
          Desactivar
        </button>
      </div>

      {notification && (
        <div
          className={`mb-6 flex items-center gap-3 rounded-uc-input border px-4 py-3 text-sm ${
            notification.type === "success"
              ? "border-ultracem-green bg-ultracem-green/5 text-ultracem-green"
              : "border-ultracem-error bg-ultracem-error/5 text-ultracem-error"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle className="h-5 w-5 shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="mb-6 rounded-uc-input border border-ultracem-error bg-ultracem-error/5 p-4">
          <p className="mb-3 text-sm font-medium text-ultracem-error">
            ¿Estás seguro de desactivar este producto? Se marcará como
            inactivo y no aparecerá en las recomendaciones del chat.
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-uc-button bg-ultracem-error px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ultracem-error/90 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Desactivando...
                </>
              ) : (
                "Sí, desactivar"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="text-sm font-medium text-ultracem-gray-600 transition-colors hover:text-ultracem-gray-900"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <ProductForm
          initialData={initialFormData}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          onCancel={() => router.push("/admin/productos")}
        />
      </div>

      <div className="mt-8">
        <PriceHistoryTable
          data={priceHistory}
          isLoading={isLoadingHistory}
        />
      </div>
    </div>
  );
}
