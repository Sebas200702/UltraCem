export default function AdminDashboard() {
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
          <p className="mt-2 text-display text-ultracem-blue">24</p>
        </div>
        <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
          <p className="text-sm font-medium text-ultracem-gray-600">
            Total de cálculos realizados
          </p>
          <p className="mt-2 text-display text-ultracem-blue">
            1,847
          </p>
        </div>
        <div className="rounded-uc-card border border-ultracem-gray-100 bg-ultracem-surface p-6 shadow-uc-card">
          <p className="text-sm font-medium text-ultracem-gray-600">
            Productos con precios desactualizados
          </p>
          <p className="mt-2 text-display text-ultracem-yellow">3</p>
        </div>
      </div>
    </div>
  );
}
