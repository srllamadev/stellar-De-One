# Contrato inicial v1

Base local: `http://localhost:8000/api/v1`. Swagger: `/docs`; OpenAPI: `/openapi.json`.

| Método y ruta | Código | JSON | Significado |
|---|---|---|---|
| GET /api/v1/health | 200 | `{"status":"ok","service":"remesas-api","version":"0.1.0"}` | Proceso vivo; no consulta BD ni proveedores |
| GET /api/v1/ready | 200 | `{"status":"ready","database":"up"}` | SELECT 1 ejecutado en PostgreSQL |
| GET /api/v1/ready | 503 | `{"status":"not_ready","database":"down"}` | BD no disponible; sin detalles de conexión |

Health no garantiza readiness. Ready no valida Pollar, migraciones aplicadas ni liquidación financiera.
La pantalla consume health de verdad desde el navegador; muestra carga, éxito o error y permite reintentar.
El cliente usa fetch nativo, timeout de 5 segundos, cancelación y validación mínima del JSON.
CORS permite exclusivamente `FRONTEND_URL` (por defecto `http://localhost:3000`).

OpenAPI es la fuente de verdad para los próximos contratos. El equipo acuerda cambios antes de
construir pantallas. `packages/contracts` reserva tipos generados a partir del esquema; solo el
pequeño tipo health se escribe manualmente en esta fase. No duplicar modelos de negocio a mano.

Pruebas manuales:

```powershell
Invoke-RestMethod http://localhost:8000/api/v1/health
Invoke-RestMethod http://localhost:8000/api/v1/ready
```

Con los servicios iniciados: `npm run smoke`. Para exigir PostgreSQL: `npm run smoke -- --require-ready`.
