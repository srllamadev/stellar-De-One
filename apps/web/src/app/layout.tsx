import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Remesas LATAM · Desarrollo",
  description: "Verificación de la infraestructura de remesas internacionales para Latinoamérica.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
