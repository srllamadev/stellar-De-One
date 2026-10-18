import assert from "node:assert/strict";

const api = process.env.SMOKE_API_URL || "http://localhost:8000";
const web = process.env.SMOKE_WEB_URL || "http://localhost:3000";
async function request(url) {
  return fetch(url, { signal: AbortSignal.timeout(15000) });
}

try {
  const health = await request(`${api}/api/v1/health`);
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: "ok", service: "remesas-api", version: "0.1.0" });
  console.log("PASS health: contrato JSON");
  const docs = await request(`${api}/docs`);
  assert.equal(docs.status, 200);
  console.log("PASS Swagger /docs");
  const homepage = await request(web);
  assert.equal(homepage.status, 200);
  assert.match(await homepage.text(), /remesas-latam/);
  console.log("PASS página principal HTTP (no sustituye prueba de navegador)");
  const ready = await request(`${api}/api/v1/ready`);
  if (process.argv.includes("--require-ready")) {
    assert.equal(ready.status, 200, "PostgreSQL requerido pero no disponible");
    assert.deepEqual(await ready.json(), { status: "ready", database: "up" });
    console.log("PASS ready: PostgreSQL disponible");
  } else {
    assert.ok([200, 503].includes(ready.status));
    const body = await ready.json();
    assert.deepEqual(body, ready.status === 200
      ? { status: "ready", database: "up" }
      : { status: "not_ready", database: "down" });
    console.log(ready.ok ? "PASS ready: PostgreSQL disponible" : "PASS respuesta 503; PENDIENTE conectividad real PostgreSQL");
  }
} catch (error) {
  console.error("FAIL smoke:", error);
  process.exitCode = 1;
}
