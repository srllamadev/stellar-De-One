"use client";
import Link from "next/link";
import {
  PageTitle,
  SessionNotice,
  amount,
  Notice,
} from "@/components/ui/product-ui";
import { useWalletData } from "@/features/wallet/use-wallet-data";
import { Activity } from "@/features/history/activity";

export function Dashboard() {
  const { session, balances, address } = useWalletData();
  const primary =
    balances.find((b) => b.code === "USDC") ??
    balances.find((b) => b.code === "XLM") ??
    balances[0];
  return (
    <>
      <PageTitle
        eyebrow="BIENVENIDO A DE-ONE"
        title="Tu dinero. Sin distancias."
        description="Un lugar para enviar, recibir y estar más cerca."
      />
      <div className="dashboard-grid">
        <section className="balance-card">
          <div className="card-top">
            <span>SALDO DISPONIBLE</span>
            <span className="subtle-pill">Wallet digital</span>
          </div>
          <div className="balance-value">
            {amount(primary?.available)} <span>{primary?.code ?? ""}</span>
          </div>
          <p>
            {!session?.verified
              ? "Conecta tu cuenta para ver tu saldo"
              : primary
                ? "Fondos de prueba · Stellar Testnet"
                : "No hay un saldo disponible para mostrar"}
          </p>
          <div className="balance-actions">
            <Link href="/send" className="button primary">
              Enviar dinero <span>↗</span>
            </Link>
            <Link href="/receive" className="button secondary">
              Recibir <span>↙</span>
            </Link>
          </div>
          <div className="balance-foot">
            <span>
              <i className={address ? "status-dot" : "status-dot muted-dot"} />
              {address ? "Wallet vinculada" : "Wallet sin conectar"}
            </span>
            <Link href="/profile">Ver detalles ↗</Link>
          </div>
        </section>
        <section className="route-card">
          <div className="card-top">
            <span>UN CAMINO MÁS SIMPLE</span>
            <span>↗</span>
          </div>
          <div className="route-art">
            <div className="country-disc brazil">BR</div>
            <div className="route-line">
              <i />
              <span>→</span>
              <i />
            </div>
            <div className="country-disc bolivia">BO</div>
          </div>
          <h2>
            De Brasil a Bolivia.
            <br />
            De ti, a los tuyos.
          </h2>
          <p>
            Pagas en tu moneda.
            <br />
            Le llega en la suya.
          </p>
          <Link href="/send">
            Explorar el corredor <span>↗</span>
          </Link>
        </section>
      </div>
      {!session?.verified && <SessionNotice />}
      {session?.walletBalance.step === "error" && (
        <Notice>
          No pudimos consultar el saldo.{" "}
          <button onClick={() => void session.refreshWalletBalance()}>
            Volver a consultar
          </button>
        </Notice>
      )}
      <div className="section-heading">
        <h2>Tus balances</h2>
        <Link href="/profile">Ver wallet ↗</Link>
      </div>
      <div className="asset-grid">
        {balances.length ? (
          balances.map((b, i) => (
            <article className="asset-card" key={`${b.code}-${b.issuer}-${i}`}>
              <span className="asset-icon">{b.code.slice(0, 1)}</span>
              <div>
                <h3>{b.code}</h3>
                <small>
                  {b.issuer ? `${b.issuer.slice(0, 8)}…` : "Activo nativo"} ·
                  Testnet
                </small>
              </div>
              <strong>{amount(b.balance)}</strong>
            </article>
          ))
        ) : (
          <article className="asset-card">
            <span className="asset-icon">◎</span>
            <div>
              <h3>Tu wallet digital</h3>
              <small>
                {session?.walletBalance.step === "loading"
                  ? "Consultando balances…"
                  : "Los activos aparecerán al conectar tu cuenta"}
              </small>
            </div>
            <strong>—</strong>
          </article>
        )}
      </div>
      <div className="section-heading">
        <h2>Últimos movimientos</h2>
        <Link href="/history">Ver todo ↗</Link>
      </div>
      <Activity compact />
      <div className="trust-strip">
        <span>
          ◈ <strong>Claridad en cada paso</strong>
          <small>Revisa los datos antes de confirmar.</small>
        </span>
        <span>
          ◎ <strong>Siempre a tu alcance</strong>
          <small>Tu dirección y tus movimientos en un lugar.</small>
        </span>
        <span>
          ↗ <strong>Conexiones que importan</strong>
          <small>Diseñado para acercarte a los tuyos.</small>
        </span>
      </div>
    </>
  );
}
