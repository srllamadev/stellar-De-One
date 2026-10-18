import type { Metadata } from "next";
import "./globals.css";
import { ProductProvider } from "@/providers/product-provider";
import { ProductShell } from "@/components/layout/product-shell";

export const metadata: Metadata = {
  title: "De-One · Tu dinero, sin distancias",
  description:
    "Pagas en tu moneda. Le llega en la suya. De Brasil a Bolivia, con De-One.",
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <ProductProvider>
          <ProductShell>{children}</ProductShell>
        </ProductProvider>
      </body>
    </html>
  );
}
