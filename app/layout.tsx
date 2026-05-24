import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
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
  icons: {
    icon: "/images/ultracem-favicon.png",
    shortcut: "/images/ultracem-favicon.png",
    apple: "/images/ultracem-favicon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#003E78",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} scroll-smooth`}>
      <body
        className="bg-ultracem-surface-off font-sans text-ultracem-gray-900 antialiased"
      >
        {children}
      </body>
    </html>
  );
}
