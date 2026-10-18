"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePollar } from "@pollar/react";
import dynamic from "next/dynamic";
import type { AuthState } from "@pollar/core";
import { publicEnv } from "@/config/env";
import "@pollar/react/styles.css";

const PollarProvider = dynamic(
  () => import("@pollar/react").then((module) => module.PollarProvider),
  { ssr: false },
);

type Session = ReturnType<typeof usePollar>;
const ProductContext = createContext<{
  session: Session | null;
  auth: AuthState | null;
}>({ session: null, auth: null });
function Bridge({ children }: { children: React.ReactNode }) {
  const session = usePollar();
  const [auth, setAuth] = useState<AuthState | null>(null);
  const client = session.getClient();
  useEffect(() => client.onAuthStateChange(setAuth), [client]);
  const stellar = session.wallets.find((wallet) => wallet.chain === "STELLAR");
  const confirmedHash = session.tx.step === "success" ? session.tx.hash : null;
  useEffect(() => {
    if (!session.verified || !stellar?.address) return;
    // Friendbot may activate the account after the provisioning job failed.
    // Ask Pollar for its current state; never override it from Horizon locally.
    void client.refreshWalletState();
  }, [client, session.verified, stellar?.address]);
  useEffect(() => {
    if (session.network !== "testnet") {
      client.setNetwork("testnet");
      return;
    }
    if (!session.verified || !stellar?.address) return;
    void client.refreshBalance().catch(() => undefined);
    void client
      .fetchTxHistory({ chain: "STELLAR", limit: 50, offset: 0 })
      .catch(() => undefined);
  }, [
    client,
    session.network,
    session.verified,
    stellar?.address,
    stellar?.provisioning,
    confirmedHash,
  ]);
  return (
    <ProductContext.Provider value={{ session, auth }}>
      {children}
    </ProductContext.Provider>
  );
}
const key = publicEnv.pollarPublishableKey;
const config = {
  apiKey: key,
  stellarNetwork: "testnet" as const,
  confirmation: "prompt" as const,
};
export function ProductProvider({ children }: { children: React.ReactNode }) {
  // Only accept Testnet publishable keys. Secret or Mainnet keys never reach the SDK.
  if (!key.startsWith("pub_testnet_")) return <>{children}</>;
  return (
    <PollarProvider client={config}>
      <Bridge>{children}</Bridge>
    </PollarProvider>
  );
}
export function useProduct() {
  return useContext(ProductContext);
}
