export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-md border border-slate-100 text-center space-y-6">
        <div className="w-16 h-16 bg-ultracem-blue rounded-2xl flex items-center justify-center mx-auto shadow-inner text-white font-bold text-2xl">
          UC
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-ultracem-blue-dark">
            UltraCem Chatbot Setup
          </h1>
          <p className="text-sm text-slate-500">
            El entorno inicial ha sido configurado con éxito usando Bun, Next.js, Tailwind CSS y TypeScript.
          </p>
        </div>
        <div className="border-t border-slate-100 pt-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Listo para desarrollo
          </span>
        </div>
      </div>
    </main>
  );
}
