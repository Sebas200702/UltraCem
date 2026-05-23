export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="card-uc max-w-md w-full space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-uc-card bg-ultracem-blue text-2xl font-bold text-white">
          UC
        </div>
        <div className="space-y-2">
          <h1 className="text-h2 text-ultracem-blue">UltraCem Chatbot</h1>
          <p className="text-body-sm text-ultracem-gray-600">
            Tema Tailwind alineado con{" "}
            <span className="font-medium text-ultracem-gray-900">foundations.md</span>
            : Montserrat, azul corporativo y acentos amarillo/verde.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary">
            Primario
          </button>
          <button type="button" className="btn-secondary">
            Secundario
          </button>
          <button type="button" className="btn-outline">
            Outline
          </button>
        </div>
        <div className="border-t border-ultracem-gray-100 pt-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-ultracem-green/10 px-3 py-1.5 text-xs font-semibold text-ultracem-green">
            <span className="h-2 w-2 animate-pulse rounded-full bg-ultracem-green" />
            Listo para desarrollo
          </span>
        </div>
      </div>
    </main>
  );
}
