"use client";
import { useState } from "react";
import { Empty, Notice } from "@/components/ui/product-ui";
import { useWalletData } from "@/features/wallet/use-wallet-data";
const statusNames = {
  SUCCESS: "Confirmada en red",
  PENDING: "Pendiente",
  FAILED: "Fallida",
};
export function Activity({ compact = false }: { compact?: boolean }) {
  const { session, records } = useWalletData();
  const [status, setStatus] = useState("");
  const [operation, setOperation] = useState("");
  const [page, setPage] = useState(0);
  const visible = records.filter(
    (t) =>
      (!status || t.status === status) &&
      (!operation || t.operation === operation),
  );
  const total =
    session?.txHistory.step === "loaded" ? session.txHistory.data.total : 0;
  return (
    <section className="activity-panel">
      {!compact && (
        <div className="filter-bar">
          <label>
            Estado
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.entries(statusNames).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Operación
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value)}
            >
              <option value="">Todos los tipos</option>
              {[...new Set(records.map((t) => t.operation))].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
          <button
            className="button secondary"
            disabled={!session?.verified}
            onClick={() =>
              void session
                ?.getClient()
                .fetchTxHistory({
                  chain: "STELLAR",
                  limit: 50,
                  offset: page * 50,
                })
            }
          >
            Actualizar ↻
          </button>
        </div>
      )}
      {session?.txHistory.step === "loading" ? (
        <p className="loading" role="status">
          Consultando movimientos…
        </p>
      ) : session?.txHistory.step === "error" ? (
        <Notice>
          No pudimos obtener tus movimientos. Intenta actualizar el historial.
        </Notice>
      ) : visible.length ? (
        <div className="transactions">
          {visible.slice(0, compact ? 4 : undefined).map((t) => (
            <details key={t.id}>
              <summary>
                <span className="transaction-icon">↗</span>
                <span className="transaction-title">
                  <strong>{t.summary || t.operation}</strong>
                  <small>{new Date(t.createdAt).toLocaleString("es-BO")}</small>
                </span>
                <span className={`transaction-state ${t.status.toLowerCase()}`}>
                  {statusNames[t.status]}
                </span>
                <span aria-hidden="true">↗</span>
              </summary>
              <div className="transaction-details">
                <dl>
                  <dt>Operación</dt>
                  <dd>{t.operation}</dd>
                  <dt>Red</dt>
                  <dd>Stellar Testnet</dd>
                  <dt>Identificador</dt>
                  <dd className="address">{t.hash}</dd>
                  {t.fee && (
                    <>
                      <dt>Costo de red</dt>
                      <dd>
                        {t.fee.amount} {t.fee.unit}
                      </dd>
                    </>
                  )}
                  {Object.entries(t.details)
                    .filter(
                      ([key, value]) =>
                        /^(amount|asset|assetCode|destination|recipient|currency)$/.test(
                          key,
                        ) &&
                        (typeof value === "string" ||
                          typeof value === "number"),
                    )
                    .map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd className="address">{String(value)}</dd>
                      </div>
                    ))}
                </dl>
                {/^[a-f0-9]{64}$/i.test(t.hash) && (
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${t.hash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver comprobante en la red ↗
                  </a>
                )}
                <p>Una confirmación de red no acredita una entrega de BOB.</p>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <Empty
          title={status || operation ? "No hay coincidencias" : undefined}
        />
      )}
      {!compact && total > 50 && (
        <div className="pagination">
          <button
            className="button secondary"
            disabled={page === 0 || session?.txHistory.step === "loading"}
            onClick={() => {
              setPage(page - 1);
              void session
                ?.getClient()
                .fetchTxHistory({
                  chain: "STELLAR",
                  limit: 50,
                  offset: (page - 1) * 50,
                });
            }}
          >
            Anterior
          </button>
          <span>
            Página {page + 1} · {total} registros. Los filtros se aplican a esta
            página.
          </span>
          <button
            className="button secondary"
            disabled={
              (page + 1) * 50 >= total || session?.txHistory.step === "loading"
            }
            onClick={() => {
              setPage(page + 1);
              void session
                ?.getClient()
                .fetchTxHistory({
                  chain: "STELLAR",
                  limit: 50,
                  offset: (page + 1) * 50,
                });
            }}
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}
