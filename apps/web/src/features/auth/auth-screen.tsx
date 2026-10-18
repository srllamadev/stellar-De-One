"use client";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/layout/product-shell";
import { Notice } from "@/components/ui/product-ui";
import { useProduct } from "@/providers/product-provider";
import type { AuthState } from "@pollar/core";

const authLabels: Record<AuthState["step"], string> = {
  idle: "Acceso listo. Puedes continuar o volver más tarde.",
  creating_session: "Preparando tu acceso…",
  entering_email: "Introduce tu correo en Pollar.",
  sending_email: "Enviando tu código de acceso…",
  entering_code: "Revisa tu correo e introduce el código en Pollar.",
  verifying_email_code: "Verificando el código…",
  opening_oauth:
    "Continúa en la ventana de acceso. Puedes cerrarla para cancelar.",
  connecting_wallet: "Conectando tu wallet…",
  signing_wallet_challenge: "Confirma tu identidad en la wallet.",
  wallet_not_installed:
    "Necesitas instalar la wallet seleccionada o usar otro método.",
  authenticating_wallet: "Verificando tu wallet…",
  creating_passkey: "Configura tu clave de acceso en el dispositivo.",
  deploying_smart_account: "Preparando tu cuenta…",
  authenticating: "Verificando tu identidad…",
  authenticated: "Identidad recibida. Verificando la sesión…",
  error:
    "No se pudo completar el acceso. Vuelve a abrir Pollar para revisar el error e intentar nuevamente.",
};

export function AuthScreen({ register = false }: { register?: boolean }) {
  const { session, auth } = useProduct();
  const router = useRouter();
  useEffect(() => {
    if (session?.isAuthenticated && session.verified)
      router.replace("/dashboard");
  }, [session?.isAuthenticated, session?.verified, router]);
  return (
    <>
      <section className="auth-story">
        <Brand />
        <div>
          <p className="eyebrow">DE BRASIL A BOLIVIA</p>
          <h1>
            Lo que envías
            <br />
            es mucho más
            <br />
            que dinero<span>.</span>
          </h1>
          <p>
            Pagas en tu moneda.
            <br />
            Le llega en la suya.
          </p>
          <div className="auth-route">
            <span>BR</span>
            <i>⟶</i>
            <span>BO</span>
          </div>
        </div>
        <small>De-One · Hecho para conectar</small>
      </section>
      <section className="auth-form">
        <div>
          <span className="subtle-pill">TU CUENTA DE-ONE</span>
          <h2>
            {register ? "Empieza a estar más cerca." : "Qué bueno verte."}
          </h2>
          <p>
            {register
              ? "Crea tu cuenta y vincula tu wallet desde un único acceso seguro."
              : "Accede a tu dinero y continúa donde lo dejaste."}
          </p>
          {session ? (
            <>
              <button
                className="button primary full"
                onClick={session.openLoginModal}
                disabled={session.configStatus === "loading"}
              >
                {session.configStatus === "loading"
                  ? "Preparando acceso…"
                  : register
                    ? "Crear mi cuenta con Pollar ↗"
                    : "Continuar con Pollar ↗"}
              </button>
              <p className="form-hint">
                El acceso oficial muestra los métodos habilitados para De-One,
                incluido email con código si está configurado. El primer acceso
                crea tu identidad; no necesitas otra contraseña.
              </p>
              {session.configStatus === "error" && (
                <Notice>
                  No se pudo cargar el acceso.{" "}
                  <button onClick={session.retryConfig}>Reintentar</button>
                </Notice>
              )}
              {auth && (
                <p className="form-hint" role="status">
                  {authLabels[auth.step]}
                </p>
              )}
            </>
          ) : (
            <Notice>
              El acceso necesita la clave publicable Testnet de Pollar en{" "}
              <code>apps/web/.env.local</code>:{" "}
              <code>NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY</code>. Configura también
              el dominio permitido de la aplicación.
            </Notice>
          )}
          <div className="auth-switch">
            {register ? "¿Ya tienes una cuenta?" : "¿Es tu primera vez?"}{" "}
            <Link href={register ? "/login" : "/register"}>
              {register ? "Inicia sesión" : "Crea tu cuenta"} ↗
            </Link>
          </div>
          <Link href="/dashboard" className="text-link">
            Explorar De-One →
          </Link>
        </div>
        <small>
          Tu sesión y tu wallet se gestionan mediante Pollar.
          <br />
          Entorno de pruebas Stellar Testnet.
        </small>
      </section>
    </>
  );
}
