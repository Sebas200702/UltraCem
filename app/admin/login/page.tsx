import { redirect } from "next/navigation";
import { AdminLoginForm } from "@/components/admin";
import { getOptionalAdminUser } from "@/lib/auth-guard";

export default async function AdminLoginPage() {
  const admin = await getOptionalAdminUser();

  if (admin) {
    redirect("/admin");
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] max-w-md items-center px-4 py-12">
      <div className="w-full rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
        <p className="text-caption font-semibold uppercase tracking-wider text-ultracem-yellow">
          Acceso administrativo
        </p>
        <h1 className="mt-2 text-h2 text-ultracem-gray-900">
          Ingresa a UltraCem Admin
        </h1>
        <p className="mt-2 text-body-sm text-ultracem-gray-600">
          Usa una cuenta con rol admin en Supabase.
        </p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
