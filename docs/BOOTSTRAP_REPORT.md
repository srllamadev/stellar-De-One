# Informe de Fase 0

Fecha: 17 de octubre de 2026, America/La_Paz. Directorio: `C:/Users/yamil/Desktop/sdfdfsd`.

## Implementación

Monorepo npm workspaces (solo web) y proyecto Python uv independiente. Pantalla Next.js
con consulta real de health desde el navegador, fetch centralizado y estados de carga/error/reintento.
API FastAPI con health, ready, Swagger, CORS y sesiones SQLAlchemy. Alembic preparado con
baseline vacía válida. Compose define PostgreSQL persistente, API y web con healthchecks.
No hay lógica financiera, cuentas, claves de blockchain ni transacciones.

Los adaptadores de Pollar y Stellar están reservados, sin clientes activos ni llamadas externas.
Documentación de arquitectura, contratos, equipo, variables y fuentes oficiales incluida.
CI tiene jobs web, API con PostgreSQL dedicado y stack Compose completo.

## Entorno y versiones

| Componente | Versión comprobada |
|---|---|
| Windows | 10.0.26200 |
| PowerShell | 7.6.5 |
| Node / npm | 22.14.0 / 10.9.2 |
| Python / uv | 3.12.4 / 0.11.29 |
| Git | 2.44.0.windows.1 |
| Next.js / React | 16.4.2 / 19.3.0 |
| TypeScript / Tailwind CSS | 5.9.3 / 4.3.3 |
| ESLint | 10.13.0 |
| FastAPI / Uvicorn | 0.143.3 / 0.54.0 |
| Pydantic / Pydantic Settings | 2.14.1 / 2.16.0 |
| SQLAlchemy / psycopg | 2.0.55 / 3.3.6 |
| Alembic / httpx | 1.20.0 / 0.28.1 |
| pytest / Ruff | 9.1.1 / 0.17.1 |
| PostgreSQL | Imagen configurada postgres:17-alpine; NO ejecutada localmente |
| Docker / Compose | NO instalados en este equipo |
| SDK Pollar | No instalado; npm confirmó core y react estables 0.11.5 |

## Pruebas ejecutadas

| Comprobación | Resultado |
|---|---|
| Instalación npm | Ejecutada; lock raíz generado |
| uv sync y uv sync --locked | Ejecutados correctamente; uv.lock generado |
| ESLint | Aprobado tras corregir enlace interno y actualización de estado desde effect |
| TypeScript | Aprobado con next typegen y tsc --noEmit |
| Next.js build | Aprobado; / y /_not-found prerenderizadas |
| Ruff | Aprobado |
| pytest | 10 aprobados, 1 omitido por falta de TEST_DATABASE_URL |
| Web :3000 | HTTP 200 y página renderizada en navegador |
| API :8000 y Swagger /docs | HTTP 200 |
| health | JSON esperado real; no depende de BD |
| ready con BD ausente | HTTP 503 con JSON not_ready/database down |
| ready con sesión simulada | SELECT 1 comprobado; éxito 200 y fallo 503 cubiertos |
| Frontend → API | Navegador mostró API conectada, remesas-api, v0.1.0, status ok |
| API detenida | Navegador mostró API no disponible al reintentar |
| Alembic offline | upgrade head --sql generó SQL válido y baseline 0001_bootstrap |
| Alembic heads | Una cabeza: 0001_bootstrap |
| Compose YAML | Validado contra JSON Schema oficial de compose-spec |
| Workflow YAML | Parseado correctamente; contiene web, api y compose |
| npm audit --omit=dev | Cero vulnerabilidades reportadas en dependencias de producción |
| Git ignore | .env locales ignorados; ejemplos y locks incluidos como archivos nuevos |
| npm run verify | Cadena completa final aprobada: ESLint, TypeScript, Ruff, pytest y build |
| npm ci --dry-run | Aprobado; comprobación adicional del lock, sin reinstalación limpia completa |
| npm run setup repetido | Conservó los tres archivos locales existentes |

El smoke HTTP se ejecutó con web/API activos y BD ausente. Detectó explícitamente que
PostgreSQL seguía pendiente; no convirtió ese estado en una aprobación de persistencia.

## Pendientes de ejecución

- `docker compose config --quiet` y `docker compose up --build`: no ejecutables; Docker no instalado.
  Se comprobó la estructura contra el esquema oficial, lo que no sustituye al motor Compose.
- Ready 200 con PostgreSQL real, migración online upgrade/downgrade y persistencia de volumen:
  pendientes. El test de integración PostgreSQL está incluido y separado, sin simular una aprobación.
- Los workflows GitHub Actions están preparados pero no ejecutados remotamente; no hubo push.
- No se instalaron ni se probaron SDK/API Pollar con credenciales. Integración deshabilitada.

Para cerrar infraestructura en una máquina con Docker:

```sh
docker compose config --quiet
docker compose up --build --wait
docker compose exec api uv run --no-sync alembic upgrade head
docker compose exec api uv run --no-sync alembic check
npm run smoke -- --require-ready
```

## Problemas encontrados y solución

- El primer create-next-app falló indicando ruta no escribible: faltaba el directorio padre apps.
  Se creó durante el bootstrap de API y la inicialización se completó al reintentar.
- npm tardó unos seis minutos en descargar dependencias y reportó EPERM al limpiar un paquete
  WASM opcional. Instaló correctamente y build/lint funcionaron. No se borraron carpetas del usuario.
- La plantilla incluía ESLint 9 ya deprecado: se actualizó a 10.13.0, permitido por el peer de Next.
- ESLint detectó un enlace HTML interno y actualización de estado disparada desde un effect;
  se usó Link y callbacks de fetch con reintento por estado para resolver ambos.
- La primera apertura del navegador agotó el tiempo; la pestaña sí se creó y luego se inspeccionó.
- La primera prueba smoke detectó web aún no iniciado; se repitió con ambos procesos activos.
- pytest emitió inicialmente advertencia de caché de Windows; posteriores ejecuciones no la repitieron.
  Persiste un aviso de deprecación de Starlette sobre httpx en TestClient; las pruebas pasan.
- npm audit completo reporta cinco alertas altas en la cadena de herramientas de lint
  eslint-config-next → plugin-next → fast-glob → micromatch → braces. `braces` 3.0.3 es la
  última publicada y sigue afectada por [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
  No se aplicó `audit fix --force`, que proponía bajar la configuración a Next 14. La auditoría
  excluyendo dev reportó cero. Revisar actualizaciones del proveedor antes de exponer herramientas
  de desarrollo a patrones de archivos no confiables.

## Pollar y Sprint 1

La investigación identifica divergencias de versión y API entre SDK, documentación y demo;
off-ramp PagFinance pendiente, webhooks semánticos y reintentos upcoming, y conectores KYC/analítica
coming soon. No asumir que fiat → USDC → fiat funciona en Testnet por existir un SDK.
Ver fuentes, credenciales y siguientes pasos en [integración Pollar](integrations/pollar/README.md).

Integrante 1 toma web y sus features; integrante 2 toma rutas, servicios, dominio e integraciones;
integrante 3 toma modelos, repositorios, todas las migraciones, infra y CI. Los primeros trabajos
son cerrar la prueba Docker, acordar contratos y dominio, modelar persistencia y diseñar UI/auth.
Backlog detallado en [TASKS](team/TASKS.md); reglas de coordinación en [WORKFLOW](team/WORKFLOW.md).

## Árbol y Git

`npm run tree` imprime el árbol real respetando .gitignore; una copia está en
[REPOSITORY_TREE.txt](REPOSITORY_TREE.txt). Incluye fuentes, documentación,
ejemplos y locks; excluye dependencias, cachés, entornos y evidencia local test-results.
El README raíz resume la estructura por responsabilidades.

Se conservó Git existente, rama main y remoto origin; README histórico adaptado. No se crearon
ramas de trabajo ficticias, commits, pushes, despliegues ni cambios remotos. Hay 90 archivos nuevos
sin seguimiento y README modificado, listos para revisión y commits pequeños del equipo.
Los tres .env locales solo contienen ejemplos y se ignoran. No se generaron credenciales reales.

Web y API quedaron ejecutándose en los puertos 3000 y 8000. La evidencia visual local de la
pantalla conectada está en `test-results/bootstrap.jpg` y `test-results/connection.jpg`, ignorada por Git.
