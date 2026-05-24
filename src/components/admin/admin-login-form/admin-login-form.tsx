"use client";

import { LogIn } from "lucide-react";
import { useAdminLoginForm } from "@/components/admin/admin-login-form/use-admin-login-form";

const inputClass =
  "min-h-12 w-full rounded-uc-input border border-ultracem-border bg-ultracem-surface px-4 text-body text-ultracem-gray-900 placeholder:text-ultracem-gray-600 focus:border-ultracem-blue focus:outline-none focus:ring-2 focus:ring-uc-focus focus:ring-offset-1 disabled:pointer-events-none disabled:opacity-50";
const labelClass =
  "mb-1.5 block text-body-sm font-medium text-ultracem-gray-900";

export function AdminLoginForm() {
  const form = useAdminLoginForm();

  return (
    <form onSubmit={form.handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="admin-email" className={labelClass}>
          Correo
        </label>
        <input
          id="admin-email"
          type="email"
          value={form.email}
          onChange={(event) => form.setEmail(event.target.value)}
          className={inputClass}
          placeholder="admin@ultracem.co"
          autoComplete="email"
          disabled={form.isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="admin-password" className={labelClass}>
          Contraseña
        </label>
        <input
          id="admin-password"
          type="password"
          value={form.password}
          onChange={(event) => form.setPassword(event.target.value)}
          className={inputClass}
          placeholder="Tu contraseña"
          autoComplete="current-password"
          disabled={form.isLoading}
          required
        />
      </div>

      {form.error && (
        <p className="rounded-uc-input border border-ultracem-error bg-ultracem-error/5 px-4 py-3 text-body-sm text-ultracem-error">
          {form.error}
        </p>
      )}

      <button
        type="submit"
        className="btn-primary inline-flex w-full items-center justify-center gap-2"
        disabled={form.isLoading}
      >
        <LogIn className="h-4 w-4" />
        {form.isLoading ? "Ingresando..." : "Ingresar al admin"}
      </button>
    </form>
  );
}
