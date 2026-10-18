export async function GET() {
  try {
    const response = await fetch("https://horizon-testnet.stellar.org/", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("network");
    const data = await response.json();
    if (data.network_passphrase !== "Test SDF Network ; September 2015")
      throw new Error("network");
    return Response.json(
      {
        network: "testnet",
        horizon: "connected",
        ledger: data.history_latest_ledger,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { network: "testnet", horizon: "unavailable" },
      { status: 503 },
    );
  }
}
