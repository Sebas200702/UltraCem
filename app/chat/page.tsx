import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Chat con Vanesa | UltraCem",
  description: "Calcula materiales de construcción con asistencia de IA.",
};

export default function ChatPage() {
  return (
    <main className="flex min-h-screen flex-col bg-ultracem-gray-100">
      <header className="flex h-16 items-center gap-3 bg-ultracem-blue px-4">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Volver al inicio"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ultracem-yellow text-sm font-bold text-ultracem-blue">
          V
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Vanesa · UltraCem</p>
          <p className="text-xs text-white/50">Asistente de materiales</p>
        </div>
      </header>
      <div className="container-uc flex flex-1 flex-col items-center justify-center py-12 text-center">
        <MessageCircle className="mb-4 h-12 w-12 text-ultracem-blue" />
        <h1 className="mb-2 text-h2 text-ultracem-blue">Chat en construcción</h1>
        <p className="mb-6 max-w-sm text-body-sm text-ultracem-gray-600">
          Pronto podrás describir tu obra y recibir el cálculo de materiales en
          menos de 90 segundos.
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
