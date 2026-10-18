import { publicEnv } from "@/config/env";
import type { HealthResponse } from "./types";

export class ApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function get(path: string, signal?: AbortSignal): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${publicEnv.apiUrl}${path}`, {
      cache: "no-store",
      signal: AbortSignal.any([AbortSignal.timeout(5000), ...(signal ? [signal] : [])]),
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new ApiError(
      error instanceof Error && error.name === "TimeoutError"
        ? "La API tardó más de 5 segundos en responder."
        : "No se pudo conectar con la API. Comprueba que está iniciada.",
    );
  }
  if (!response.ok) throw new ApiError(`La API respondió HTTP ${response.status}.`, response.status);
  try {
    return await response.json();
  } catch {
    throw new ApiError("La API devolvió una respuesta JSON inválida.");
  }
}

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const result = await get("/api/v1/health", signal);
  if (
    typeof result !== "object" || result === null ||
    !("status" in result) || result.status !== "ok" ||
    !("service" in result) || result.service !== "remesas-api" ||
    !("version" in result) || result.version !== "0.1.0"
  ) throw new ApiError("La respuesta no coincide con el contrato de health.");
  return result as HealthResponse;
}
