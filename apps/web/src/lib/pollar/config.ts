import { publicEnv } from "@/config/env";

export function getPollarState() {
  return {
    network: "testnet",
    enabled: false,
    message: publicEnv.pollarPublishableKey
      ? "Clave publicable presente. Integración deshabilitada en esta fase."
      : "Pollar no está configurado. La aplicación puede arrancar sin credenciales.",
  } as const;
}
