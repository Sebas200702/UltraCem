"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";

export default function NuevoProductoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    setNotification(null);

    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error?.message || "Error al crear el producto."
        );
      }

      setNotification({
        type: "success",
        message: "Producto creado exitosamente.",
      });

      setTimeout(() => {
        router.push("/admin/productos");
      }, 1200);
    } catch (err) {
      setNotification({
        type: "error",
        message:
          err instanceof Error ? err.message : "Error al crear el producto.",
      });
    } finally {
      setIsLoading(false);
    }
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

      <h1 className="mb-8 text-2xl font-semibold text-ultracem-gray-900">
        Nuevo producto
      </h1>

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

      <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <ProductForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => router.push("/admin/productos")}
        />
      </div>
    </div>
  );
}
