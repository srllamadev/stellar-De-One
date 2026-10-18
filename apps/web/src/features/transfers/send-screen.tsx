"use client";
import { useState } from "react";
import { PageTitle, Notice, SessionNotice } from "@/components/ui/product-ui";
import { useWalletData } from "@/features/wallet/use-wallet-data";

export function SendScreen() {
  const { session, address } = useWalletData();
  const [mode, setMode] = useState("remittance");
  const [recipient, setRecipient] = useState("");
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const canSend =
    session?.verified &&
    address &&
    session.network === "testnet" &&
    session.wallet?.provisioning === "READY";
  return (
    <>
      <PageTitle
        eyebrow="ENVÍA CON DE-ONE"
        title="Más cerca, en cada envío."
        description="Elige tu destino. Revisa los detalles. Tú tienes la última palabra."
      />
      <div className="send-grid">
        <section className="panel send-form">
          <div className="segmented" aria-label="Tipo de envío">
            <button
              className={mode === "remittance" ? "selected" : ""}
              onClick={() => {
                setMode("remittance");
                setMessage("");
              }}
            >
              Brasil → Bolivia
            </button>
            <button
              className={mode === "digital" ? "selected" : ""}
              onClick={() => {
                setMode("digital");
                setMessage("");
              }}
            >
              Saldo digital · Testnet
            </button>
          </div>
          {mode === "remittance" ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setMessage("");
                try {
                  const response = await fetch("/api/remittances/quote", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      recipient,
                      amount: value,
                      source: "BRL",
                      destination: "BOB",
                    }),
                  });
                  const data = await response.json();
                  setMessage(
                    data.message ?? "No se pudo obtener una cotización.",
                  );
                } catch {
                  setMessage(
                    "No pudimos consultar el servicio. Intenta nuevamente.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div className="step-label">
                <span>01</span> ¿A quién se lo envías?
              </div>
              <label>
                Destinatario
                <input
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="@usuario o +591…"
                  maxLength={64}
                  autoComplete="off"
                />
              </label>
              <p className="form-hint">
                La búsqueda de usuarios y teléfonos requiere un directorio
                verificado; todavía no está conectado.
              </p>
              <div className="step-label">
                <span>02</span> Tu envío
              </div>
              <div className="currency-pair">
                <div>
                  <small>Tú pagas</small>
                  <strong>
                    BRL <span>Brasil</span>
                  </strong>
                </div>
                <span>→</span>
                <div>
                  <small>Recibe</small>
                  <strong>
                    BOB <span>Bolivia</span>
                  </strong>
                </div>
              </div>
              <label>
                Importe en reales
                <input
                  required
                  inputMode="decimal"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  pattern="[0-9]+([.][0-9]{1,2})?"
                  placeholder="0.00"
                  maxLength={12}
                />
              </label>
              <Notice>
                PIX, cambio BRL/BOB y entrega local necesitan proveedores
                habilitados. Todavía no hay una cotización disponible para este
                corredor.
              </Notice>
              <button className="button primary full" disabled={busy}>
                {busy ? "Consultando…" : "Consultar disponibilidad ↗"}
              </button>
              {message && <Notice>{message}</Notice>}
            </form>
          ) : (
            <>
              <div className="step-label">
                <span>01</span> Transfiere desde tu wallet
              </div>
              <h2>Un envío digital, paso a paso.</h2>
              <p>
                Selecciona el activo disponible, introduce una dirección Stellar
                y revisa el importe, el costo de red y los datos antes de firmar
                en Pollar.
              </p>
              <Notice>
                Esta operación utiliza activos de prueba en Stellar Testnet. No
                convierte BRL ni entrega BOB. El destinatario necesita una
                cuenta preparada y, para tokens, la trustline correspondiente.
              </Notice>
              {!session?.verified ? (
                <SessionNotice />
              ) : (
                <button
                  className="button primary full"
                  disabled={!canSend}
                  onClick={() => {
                    if (canSend) session.openSendModal();
                  }}
                >
                  Preparar y revisar envío ↗
                </button>
              )}
              {session?.verified && !canSend && (
                <Notice>
                  Necesitas una wallet Stellar preparada y una sesión verificada
                  en Testnet. Revisa tu perfil.
                </Notice>
              )}
              {session?.tx.step === "error" && (
                <Notice>
                  La operación no se completó. Revisa su estado en Pollar antes
                  de reintentar.
                </Notice>
              )}
              {session &&
                (session.tx.step === "submitted" ||
                  session.tx.step === "success") && (
                  <Notice>
                    {session.tx.step === "success"
                      ? "Confirmada en Stellar Testnet."
                      : "Enviada a la red; confirmación pendiente."}
                    <br />
                    <a
                      className="address"
                      href={`https://stellar.expert/explorer/testnet/tx/${session.tx.hash}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {session.tx.hash} ↗
                    </a>
                  </Notice>
                )}
            </>
          )}
        </section>
        <aside className="send-aside">
          <section className="panel">
            <span className="eyebrow">SIN SORPRESAS</span>
            <h2>
              Todo claro.
              <br />
              Antes de enviar.
            </h2>
            <p>Una cotización válida debe incluir:</p>
            <ul className="checklist">
              <li>Importe y moneda de origen</li>
              <li>Tipo de cambio aplicado</li>
              <li>Tarifa De-One y costos externos</li>
              <li>Importe neto en destino</li>
              <li>Fecha y hora de vencimiento</li>
            </ul>
            <div className="quote-placeholder">
              <span>Recibe tu destinatario</span>
              <strong>
                — <small>{mode === "remittance" ? "BOB" : "Testnet"}</small>
              </strong>
              <small>
                {mode === "remittance"
                  ? "Esperando proveedor de cotización"
                  : "Revisa el desglose en el flujo de Pollar"}
              </small>
            </div>
          </section>
          <p className="form-hint">
            Ninguna operación se considera completada por pulsar un botón.
            Podrás comprobar el resultado con su identificador.
          </p>
        </aside>
      </div>
    </>
  );
}
