"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { PageTitle, Notice, SessionNotice } from "@/components/ui/product-ui";
import { useWalletData } from "./use-wallet-data";
export function ReceiveScreen() {
  const { session, address } = useWalletData();
  const [qr, setQr] = useState<{ address: string; url: string } | null>(null);
  const [feedback, setFeedback] = useState("");
  useEffect(() => {
    let active = true;
    if (address)
      void QRCode.toDataURL(address, {
        width: 280,
        margin: 3,
        errorCorrectionLevel: "M",
      })
        .then((url) => {
          if (active && address) setQr({ address, url });
        })
        .catch(() => {
          if (active)
            setFeedback(
              "No pudimos generar el QR. Puedes copiar la dirección.",
            );
        });
    return () => {
      active = false;
    };
  }, [address]);
  return (
    <>
      <PageTitle
        eyebrow="RECIBIR"
        title="Comparte tu dirección."
        description="Tu próximo envío está a una conexión de distancia."
      />
      {!session?.verified ? (
        <SessionNotice />
      ) : !address ? (
        <Notice>
          Tu wallet aún no está disponible. Puedes crearla desde tu perfil.
        </Notice>
      ) : (
        <div className="receive-grid">
          <section className="panel receive-card">
            <span className="subtle-pill">STELLAR TESTNET</span>
            <h2>Recibe en tu wallet</h2>
            {qr?.address === address ? (
              <Image
                unoptimized
                className="qr"
                src={qr.url}
                width={240}
                height={240}
                alt="QR de tu dirección pública Stellar Testnet"
              />
            ) : (
              <p>Preparando QR…</p>
            )}
            <p className="address">{address}</p>
            <button
              className="button primary full"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(address);
                  setFeedback("Dirección copiada.");
                } catch {
                  setFeedback(
                    "No se pudo copiar. Selecciona y copia la dirección manualmente.",
                  );
                }
              }}
            >
              Copiar dirección <span>⧉</span>
            </button>
            {feedback && <p role="status">{feedback}</p>}
          </section>
          <section className="panel instructions">
            <span className="eyebrow">ASÍ DE SENCILLO</span>
            <h2>
              Una dirección.
              <br />
              Más posibilidades.
            </h2>
            <ol>
              <li>Comparte tu dirección o deja que escaneen el QR.</li>
              <li>
                Pide al remitente que use Stellar Testnet y un activo
                compatible.
              </li>
              <li>Consulta el movimiento y su estado en tu historial.</li>
            </ol>
            <Notice>
              Esta dirección recibe activos de prueba. No recibe PIX ni
              depósitos bancarios en BRL o BOB. Para tokens, comprueba antes el
              activo y su emisor en Pollar.
            </Notice>
            {session.wallet?.provisioning !== "READY" && (
              <Notice>
                La wallet puede seguir en preparación. Comprueba su estado antes
                de recibir.
              </Notice>
            )}
          </section>
        </div>
      )}
    </>
  );
}
