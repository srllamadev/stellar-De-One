"use client";
import { useProduct } from "@/providers/product-provider";

export function useWalletData() {
  const { session } = useProduct();
  const address =
    session?.wallets.find((w) => w.chain === "STELLAR")?.address ??
    (session?.wallet?.chain === "STELLAR" ? session.wallet.address : undefined);
  const balances =
    session?.verified &&
    session.network === "testnet" &&
    session.walletBalance.step === "loaded"
      ? session.walletBalance.data.balances.filter(
          (b) => !b.chain || b.chain === "STELLAR",
        )
      : [];
  const records =
    session?.verified &&
    session.network === "testnet" &&
    session.txHistory.step === "loaded"
      ? session.txHistory.data.records.filter(
          (t) => t.chain === "STELLAR" && t.network === "testnet",
        )
      : [];
  return { session, address, balances, records };
}
