"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, Notice, SessionNotice } from "@/components/ui/product-ui";
import { useWalletData } from "./use-wallet-data";
export function ProfileScreen() {
  const { session, address } = useWalletData();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [horizon, setHorizon] = useState("Comprobando…");
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      setReduced(document.documentElement.classList.contains("reduce-motion")),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void fetch("/api/network", { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(() => setHorizon("Conectada"))
      .catch(() => {
        if (!controller.signal.aborted) setHorizon("No disponible");
      });
    return () => controller.abort();
  }, []);
  const profile = session?.verified
    ? session.getClient().getUserProfile()
    : null;
  const stellarWallet = session?.wallets.find(
    (wallet) => wallet.chain === "STELLAR",
  );
  return (
    <>
      <PageTitle
        eyebrow="TU CUENTA"
        title="Todo en su lugar."
        description="Tu identidad, tu wallet y tus preferencias."
      />
      {!session?.verified && <SessionNotice />}
      <div className="profile-grid">
        <section className="panel">
          <span className="avatar large">D</span>
          <h2>Perfil De-One</h2>
          <dl>
            <dt>Correo</dt>
            <dd>{profile?.mail || "Disponible después de iniciar sesión"}</dd>
            <dt>Sesión</dt>
            <dd>
              {session?.verified
                ? "Verificada"
                : session?.isAuthenticated
                  ? "Verificando sesión…"
                  : "Sin conectar"}
            </dd>
            <dt>Wallet</dt>
            <dd className="address">
              {address ?? "Sin wallet Stellar vinculada"}
            </dd>
            <dt>Estado de wallet</dt>
            <dd>
              {stellarWallet?.provisioning === "READY"
                ? "Preparada"
                : stellarWallet?.provisioning === "CREATING"
                  ? "En preparación"
                  : stellarWallet?.provisioning === "FAILED"
                    ? "Pollar reporta un fallo de preparación"
                    : "Pendiente"}
            </dd>
          </dl>
          {session?.verified && address && (
            <>
              {stellarWallet?.provisioning === "FAILED" && (
                <Notice>
                  La cuenta puede estar financiada en Stellar y seguir pendiente
                  de actualización en Pollar. Actualiza el estado; si Pollar
                  mantiene el fallo, se necesita revisar la preparación en ese
                  servicio. No vuelvas a financiar la cuenta por este aviso.
                </Notice>
              )}
              <button
                className="button secondary"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const client = session.getClient();
                    const state = await client.refreshWalletState();
                    await client.refreshBalance();
                    setMessage(
                      state === "READY"
                        ? "Pollar confirma que la wallet está preparada. Saldo actualizado."
                        : state === "FAILED"
                          ? "Pollar sigue reportando un fallo. La financiación externa no garantiza que su preparación interna esté completa. Revisa el proyecto o contacta con soporte Pollar con tu dirección pública."
                          : state === "CREATING"
                            ? "Pollar sigue preparando la wallet. Vuelve a comprobar en unos momentos."
                            : "No se pudo confirmar el estado con Pollar. Intenta nuevamente.",
                    );
                  } catch {
                    setMessage(
                      "No se pudo actualizar el saldo. Intenta nuevamente; no se enviaron fondos.",
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {busy ? "Actualizando…" : "Actualizar estado y saldo"}
              </button>
            </>
          )}
          {session?.verified && !session.hasWallet && (
            <button
              className="button primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await session.createWallet();
                  setMessage(
                    "Wallet solicitada. Su preparación puede tardar unos momentos.",
                  );
                } catch {
                  setMessage(
                    "No pudimos crear la wallet. Revisa la configuración del proyecto e intenta de nuevo.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Crear mi wallet
            </button>
          )}
          {message && <Notice>{message}</Notice>}
          {session?.verified && (
            <button
              className="button secondary"
              onClick={() => {
                session.logout();
                router.replace("/login");
              }}
            >
              Cerrar sesión ↗
            </button>
          )}
        </section>
        <div>
          <section className="panel">
            <h2>Conexión del servicio</h2>
            <dl>
              <dt>Red</dt>
              <dd>Stellar Testnet</dd>
              <dt>Horizon</dt>
              <dd>{horizon}</dd>
              <dt>Acceso Pollar</dt>
              <dd>
                {session
                  ? "Clave Testnet configurada"
                  : "Requiere clave publicable Testnet"}
              </dd>
              <dt>PIX y entrega en BOB</dt>
              <dd>Proveedor pendiente</dd>
            </dl>
            <p className="form-hint">
              La conexión de red, la sesión y la wallet son estados
              independientes.
            </p>
          </section>
          <section className="panel">
            <h2>Preferencias</h2>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => {
                  setReduced(e.target.checked);
                  document.documentElement.classList.toggle(
                    "reduce-motion",
                    e.target.checked,
                  );
                }}
              />
              Reducir animaciones durante esta sesión
            </label>
            <p className="form-hint">
              Idioma: español · También respetamos la preferencia de movimiento
              de tu dispositivo.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
