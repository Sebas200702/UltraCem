import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UltraCem | Calculadora de materiales con IA",
  description:
    "Asistente para calcular cemento, arena y materiales de construcción.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} scroll-smooth`}>
      <body
        className="font-sans bg-ultracem-surface-off text-ultracem-gray-900 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
