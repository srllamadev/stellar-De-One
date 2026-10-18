"use client";

import { useEffect, useState } from "react";
import { publicEnv } from "@/config/env";
import { getHealth } from "@/lib/api/client";
import type { HealthResponse } from "@/lib/api/types";

type State = { kind: "loading" } | { kind: "connected"; data: HealthResponse } | { kind: "error"; message: string };

export function ConnectionStatus() {
  const [state, setState] = useState<State>({ kind: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const request = new AbortController();
    getHealth(request.signal).then((data) => {
      if (!request.signal.aborted) setState({ kind: "connected", data });
    }).catch((error: unknown) => {
      if (!request.signal.aborted) setState({ kind: "error", message: error instanceof Error ? error.message : "No se pudo conectar con la API." });
    });
    return () => request.abort();
  }, [attempt]);
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Conexión con el backend</p>
      <div role="status" aria-live="polite" className="mt-4">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${state.kind === "connected" ? "bg-teal-600" : state.kind === "error" ? "bg-red-500" : "bg-amber-400"}`} />
          {state.kind === "connected" ? "API conectada" : state.kind === "error" ? "API no disponible" : "Comprobando conexión…"}
        </h2>
        <p className="mt-3 min-h-10 text-sm leading-5 text-slate-600">
          {state.kind === "connected" ? `${state.data.service} · v${state.data.version} · status: ${state.data.status}` : state.kind === "error" ? state.message : "Consultando GET /api/v1/health desde tu navegador."}
        </p>
      </div>
      <p className="mt-2 break-all font-mono text-xs text-slate-500">{publicEnv.apiUrl}</p>
      <button onClick={() => { setState({ kind: "loading" }); setAttempt((value) => value + 1); }} disabled={state.kind === "loading"} className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50">Volver a comprobar</button>
      <p className="mt-4 text-xs leading-5 text-slate-500">Health confirma que la API está viva. La base de datos se comprueba por separado en /api/v1/ready.</p>
    </article>
  );
}
