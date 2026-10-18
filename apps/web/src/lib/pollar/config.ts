import { publicEnv } from "@/config/env";

export function getPollarState() {
  return {
    network: "testnet",
    enabled: publicEnv.pollarPublishableKey.startsWith("pub_testnet_"),
    message: publicEnv.pollarPublishableKey.startsWith("pub_testnet_")
      ? "Pollar configurado para Testnet. La sesión y la wallet se verifican por separado."
      : "Configura una clave publicable Testnet de Pollar para conectar tu cuenta.",
  } as const;
}
