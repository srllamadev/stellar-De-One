# Pollar y Stellar — investigación y límite de la Fase 0

Consulta: 17 de octubre de 2026 (America/La_Paz). Solo lectura de fuentes públicas y npm;
no se llamó a una API financiera ni se usaron credenciales.

## Fuentes verificables

- [SDK oficial](https://github.com/pollar-xyz/pollar), commit `a0565f012fb3e79d8d0715714c8713269ad47a7a`.
- [Documentación](https://github.com/pollar-xyz/pollar-docs), commit `b4a3e0698de1659f693e09022d4a5e6cf4107f62`.
- [Demo solicitada](https://github.com/pollar-xyz/demo-nextjs) redirige a [demo](https://github.com/pollar-xyz/demo), commit `f83b88e35038442efcbd271446088fa8490e66ae`.
- [Quickstart](https://github.com/pollar-xyz/pollar-docs/blob/b4a3e0698de1659f693e09022d4a5e6cf4107f62/docs/getting-started/quickstart.md).
- [Claves](https://github.com/pollar-xyz/pollar-docs/blob/b4a3e0698de1659f693e09022d4a5e6cf4107f62/docs/getting-started/api-keys.md).
- [Rampas y proveedores](https://github.com/pollar-xyz/pollar-docs/blob/b4a3e0698de1659f693e09022d4a5e6cf4107f62/docs/operator-guide/ramps/providers.md).
- [Webhooks](https://github.com/pollar-xyz/pollar-docs/blob/b4a3e0698de1659f693e09022d4a5e6cf4107f62/docs/sdk-reference/webhooks.md).

## Funcionalidades confirmadas en fuentes, no probadas con cuenta

`npm view` confirmó `@pollar/core` y `@pollar/react` estables en 0.11.5. Core expone
`PollarClient`; React ofrece `PollarProvider`, `usePollar` y componentes de wallet.
El quickstart documenta login, consulta de balances, historial y construcción/firma/envío
de transacciones Stellar mediante `runTx` o pasos separados. Las rampas tienen widgets
y métodos documentados para cotizar y crear órdenes.

No se instala ningún SDK en esta fase: no hace falta para probar infraestructura.
No existe dependencia `@pollar/sdk` en este proyecto.

## Discrepancias y funcionalidades pendientes de verificar

- La rama main de core declara `0.12.0-rc.1`, mientras npm publica `0.11.5` estable;
  la demo inspeccionada fija `0.11.4-rc.4`. Antes de integrar, revisar tipos de la versión
  estable elegida; no copiar ejemplos de ramas distintas sin comprobarlos.
- El README del SDK menciona cambios a API v2, mientras otras páginas describen rutas v1.
  No implementamos rutas de proveedor hasta confirmar su contrato y autenticación vigentes.
- Validar país, dirección del corredor, moneda, límites, entorno sandbox, KYC, comisiones,
  emisor exacto de USDC y disponibilidad real por cuenta/proveedor.
- PagFinance: la documentación indica off-ramp pendiente; la tabla general sugiere ambas
  direcciones y el texto explica restricciones. No asumir venta operativa por esa tabla.
- Los webhooks semánticos de wallets/pagos y sus reintentos aparecen como upcoming;
  la página describe solo una entrega interna genérica de Stellar sin reintentos.
  No se crean handlers ni nombres de eventos en la aplicación.
- Conectores adicionales de KYC y analítica aparecen como coming soon.

## Credenciales y configuración

La documentación de claves distingue `pub_testnet_` (publicable) y `sec_testnet_` (secreta).
Las variables de ejemplo quedan vacías: no contienen claves reales ni cadenas utilizables.

| Variable | Ubicación | Uso futuro |
|---|---|---|
| NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY | apps/web/.env.local | SDK React en navegador |
| POLLAR_SECRET_KEY | apps/api/.env | Solo operaciones backend autorizadas |
| POLLAR_ENABLED=false | apps/api/.env | Integración deshabilitada; true solo cambia diagnóstico |
| STELLAR_NETWORK=testnet | apps/api/.env | Única red admitida en Fase 0 |

Aunque se configure una clave, no se instancia un cliente ni se envía una solicitud.
La pantalla indica ausencia de configuración o integración deshabilitada. Las credenciales
presentes no significan integración terminada. Nunca poner la secreta en NEXT_PUBLIC_*.

## Integración prevista y límites fiat → USDC → fiat

El frontend encapsulará un provider cliente y sus hooks dentro de `src/lib/pollar` y
`src/providers`; la API usará `app/integrations/pollar` y `app/integrations/stellar` detrás
de casos de uso. Python no ejecuta el SDK React; cualquier comunicación backend deberá
seguir el contrato HTTP oficial confirmado, sin endpoints supuestos.

Una transferencia de USDC no verifica que se haya recibido o entregado fiat. Cada rampa
depende del proveedor, corredor, KYC, conciliación y disponibilidad contractual.
La demo incluye integraciones ajenas al alcance y describe Abroad sin sandbox:
no se debe copiar ese flujo para una prueba Testnet. No se promete cobertura LATAM completa.

## Próxima prueba Testnet

1. Confirmar acceso a un proyecto Testnet y dominio permitido en el panel, sin Mainnet.
2. Elegir versiones estables compatibles de core/react y verificar sus tipos publicados.
3. Confirmar el contrato HTTP backend, permisos y autenticación con documentación vigente.
4. Obtener claves Testnet fuera de Git y activar una implementación revisada del adapter.
5. Verificar wallet preparada, activo y emisor Testnet y patrocinio con recursos de prueba.
6. Probar operaciones Testnet y registrar hash/ledger antes de afirmar éxito.
7. Evaluar rampas solo si existe sandbox confirmado para el corredor; de otro modo mantenerlas deshabilitadas.

No se generaron seeds, no se crearon cuentas y no se ejecutaron transacciones en esta fase.
