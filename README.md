# remesas-latam

Base técnica para una aplicación de remesas internacionales en Latinoamérica.
El producto previsto conecta fiat → USDC → Stellar → fiat, con una experiencia tradicional
de remesas. **Fase 0 únicamente:** pantalla de conexión, API y configuración de persistencia.
No hay login productivo, pagos, cotizaciones, KYC ni envíos de fondos.

El remoto conserva el nombre histórico `stellar-De-One`. Se mantuvo su raíz Git y rama main.

## Tecnologías y arquitectura

Next.js / React / TypeScript / Tailwind en `apps/web`; FastAPI / Pydantic / SQLAlchemy 2 /
psycopg 3 / Alembic en `apps/api`; PostgreSQL 17 en Compose.
Node 22, npm workspaces solo para web; Python 3.12 administrado por uv.
Los locks `package-lock.json` y `apps/api/uv.lock` fijan las versiones resueltas.

El navegador consulta health directamente en FastAPI. La API es la única capa que accede
a PostgreSQL. Los futuros proveedores quedan encapsulados y Pollar permanece deshabilitado.
Ver [arquitectura](docs/architecture/README.md), [contrato API](docs/api/README.md)
y [verificación de Pollar](docs/integrations/pollar/README.md).

```text
apps/
  web/                 Next.js, src/app, components, features, lib/api, lib/pollar
  api/                 FastAPI, app/{api,core,models,schemas,repositories,services,integrations,domain}
    alembic/versions/  Baseline ejecutable sin tablas financieras
    tests/             Tests unitarios y PostgreSQL opcional
packages/contracts/    Reserva para tipos generados desde OpenAPI
infra/{postgres,docker}/ Notas operativas
docs/                  Arquitectura, API, integraciones y equipo
scripts/               Setup de entorno y smoke HTTP
.github/workflows/     Lint, TypeScript, build, tests, PostgreSQL y Compose
compose.yaml           web + api + db
```

## Requisitos

- Node.js 22.14+ dentro de la línea 22 (`.nvmrc`) y npm 10/11.
- Python 3.12 y [uv](https://docs.astral.sh/uv/getting-started/installation/) (validado con 0.11.29).
- Git; Docker Engine/Desktop con plugin Compose v2 para la BD y el modo completo.
- Windows: PowerShell; Docker Desktop debe usar contenedores Linux y tener su motor activo.

No se requiere cuenta Pollar para instalar, construir o probar la Fase 0.

## Instalación

```sh
npm install
uv sync --directory apps/api --frozen
npm run setup
```

`setup` copia ejemplos solo si el destino no existe; conserva la configuración actual.
En CI o tras clonar con un lock vigente: `npm ci`.
No instalar el backend con npm ni crear otro repositorio dentro de apps.

## Ejecución con Docker

```sh
docker compose config --quiet
docker compose up --build
```

Desde otra terminal, aplicar la baseline:

```sh
docker compose exec api uv run --no-sync alembic upgrade head
npm run smoke -- --require-ready
```

Compose incluye valores de ejemplo locales por defecto; puede arrancar sin copiar .env.
La raíz `.env` permite cambiarlos. API espera db saludable; web espera ready saludable.
Hay recarga de código de desarrollo mediante montajes. Para parar: `docker compose down`.
El volumen conserva datos. No usar `down -v` si necesitas conservarlos.

## Ejecución local con PostgreSQL en Docker

```sh
npm run db:up
npm run db:migrate
```

En dos terminales desde la raíz:

```sh
npm run dev:api
```

```sh
npm run dev:web
```

Abrir [web](http://localhost:3000), [Swagger](http://localhost:8000/docs),
[health](http://localhost:8000/api/v1/health) y [ready](http://localhost:8000/api/v1/ready).
Se puede desarrollar web y API sin Docker: health sigue operativo y ready devuelve 503
hasta disponer de PostgreSQL. Ese modo no comprueba persistencia.

## Puertos y variables

| Servicio | Host | Dentro de Compose |
|---|---|---|
| Web | localhost:3000 | web:3000 |
| API | localhost:8000 | api:8000 |
| PostgreSQL | localhost:5433 | db:5432 |

| Archivo | Consumidor | Variables |
|---|---|---|
| .env raíz | Sustitución de Compose | POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD |
| apps/web/.env.local | Next.js local | NEXT_PUBLIC_API_URL, NEXT_PUBLIC_POLLAR_PUBLISHABLE_KEY |
| apps/api/.env | Pydantic Settings y Alembic locales | APP_ENV, DATABASE_URL, FRONTEND_URL, POLLAR_SECRET_KEY, POLLAR_ENABLED, STELLAR_NETWORK |

Los archivos `.env.example` están versionados; los archivos locales se ignoran.
En contenedores, Compose inyecta variables explícitas y no monta .env de host.
DATABASE_URL usa `localhost:5433` en host y `db:5432` dentro de Compose.
NEXT_PUBLIC_API_URL usa `http://localhost:8000` en ambos modos porque lo consume el navegador.
Reiniciar Next tras cambiar variables públicas; un build las fija al construir.

Credenciales PostgreSQL de ejemplo: remesas_local / local_dev_only_change_me, BD remesas_latam.
Son solo para desarrollo. Si cambias las de raíz, actualiza también DATABASE_URL local.
Usar caracteres URI seguros o codificar usuario/contraseña dentro de DATABASE_URL.
La API solo admite APP_ENV development/test y STELLAR_NETWORK testnet durante esta fase.
No colocar secretos en NEXT_PUBLIC_* ni en Git.

## Comandos de calidad

```sh
npm run lint:web
npm run typecheck:web
npm run build:web
npm run lint:api
npm run test:api
npm run verify
npm run smoke
```

`verify` se detiene en el primer fallo. `smoke` exige API y web ejecutándose; informa si
ready devuelve 503. `npm run smoke -- --require-ready` también exige PostgreSQL disponible.
Las pruebas unitarias comprueban contrato health, CORS, configuración y ready con BD simulada.
Para el test real PostgreSQL, configurar TEST_DATABASE_URL con una BD dedicada de prueba.
CI aplica/revierte la baseline y ejecuta ese test, además de arrancar Compose completo.
Los workflows aún no están ejecutados remotamente: no se hizo push.

Más comandos: `npm run db:down` detiene únicamente db sin borrar el volumen.
`uv run --directory apps/api alembic upgrade head --sql` valida SQL offline sin conexión.
El informe local de comprobaciones está en [docs/BOOTSTRAP_REPORT.md](docs/BOOTSTRAP_REPORT.md).

## Equipo y Sprint 1

1. Frontend: `apps/web/` — diseño responsive, UI, auth, dashboard, remesas e historial.
2. Backend: rutas, schemas, servicios, dominio e integraciones — contratos y validaciones.
3. BD/DevOps: modelos, repositorios, Alembic, infra, Compose y CI — persistencia y auditoría.

Integrante 3 administra migraciones. Integrantes 2 y 3 acuerdan dominio y modelos.
Integrante 1 consume contratos documentados. Nadie modifica otra área sin coordinarlo.
Ver [workflow](docs/team/WORKFLOW.md) y [backlog](docs/team/TASKS.md).

## Problemas frecuentes

- `docker` no se reconoce: instalar Docker Desktop/Engine y Compose; arrancar el motor.
  No se puede verificar la BD ni el stack completo hasta disponer de esa herramienta.
- `uv` no se reconoce: instalar uv y abrir una nueva terminal con PATH actualizado.
- Puerto ocupado: detener el servicio propio que lo usa o coordinar el cambio de puertos,
  DATABASE_URL, FRONTEND_URL y NEXT_PUBLIC_API_URL. Los scripts de desarrollo usan 3000/8000.
- API no conectada en web: comprobar health, URL pública y CORS. Usar localhost de forma
  coherente; acceder por 127.0.0.1 requiere cambiar FRONTEND_URL a ese origen y reiniciar API.
- Ready 503: revisar PostgreSQL, puerto, DATABASE_URL y credenciales; health puede seguir en 200.
- Autenticación BD falla tras cambiar .env: un volumen existente conserva el usuario y contraseña
  de su inicialización. Cambiar mediante SQL o preparar otro volumen tras revisar sus datos.
- Migración falla: ejecutar desde raíz con scripts; comprobar db y no incluir secretos en logs compartidos.
- Pollar no configurado: es el estado esperado. Credenciales solas no habilitan operaciones.
- npm lento: las descargas iniciales pueden tardar. No ejecutar instalaciones simultáneas sobre el mismo lock.
