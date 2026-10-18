export async function POST(request: Request) {
  // Next's internal request URL can use localhost behind a reverse proxy.
  // Compare the browser's origin against the actual HTTP Host instead.
  let sameOrigin = false;
  try {
    const origin = new URL(request.headers.get("origin") || "");
    sameOrigin =
      ["http:", "https:"].includes(origin.protocol) &&
      origin.host === request.headers.get("host");
  } catch {
    /* Missing or malformed Origin is not accepted. */
  }
  if (!sameOrigin)
    return Response.json({ message: "Origen no permitido." }, { status: 403 });
  try {
    const body = await request.text();
    if (body.length > 2048)
      return Response.json(
        { message: "Solicitud demasiado grande." },
        { status: 413 },
      );
    const response = await fetch(
      `${process.env.API_INTERNAL_URL || "http://localhost:8000"}/api/v1/remittances/quote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: AbortSignal.timeout(8000),
        cache: "no-store",
      },
    );
    if (response.status === 422)
      return Response.json(
        {
          message:
            "Revisa el importe (máximo dos decimales), la moneda y el destinatario (@usuario o teléfono internacional).",
        },
        { status: 422 },
      );
    if (response.status !== 503)
      return Response.json(
        { message: "El servicio de cotizaciones no está habilitado." },
        { status: 503 },
      );
    const data = await response.json();
    return Response.json(
      {
        message:
          data.detail?.message ??
          "No hay un proveedor habilitado para BRL → BOB.",
      },
      { status: 503 },
    );
  } catch {
    return Response.json(
      {
        message:
          "El servicio de cotizaciones no está disponible. Intenta más tarde.",
      },
      { status: 503 },
    );
  }
}
