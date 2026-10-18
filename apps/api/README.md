# API FastAPI

Python 3.12 + uv; SQLAlchemy 2/psycopg 3, Alembic y Pydantic Settings.

Desde raíz:

```sh
uv sync --directory apps/api --frozen
npm run setup
npm run dev:api
```

API :8000; Swagger /docs; contrato en [docs/api](../../docs/api/README.md).
`npm run test:api`, `npm run lint:api`, `npm run db:migrate` se ejecutan desde raíz.
Config: `apps/api/.env`, resuelto por ruta absoluta; variables del proceso tienen precedencia.
No usar credenciales reales. `POLLAR_ENABLED` queda false; no hay cliente financiero activo.

Para conexión real, iniciar db con `npm run db:up`, luego migrar. DATABASE_URL en host usa
localhost:5433; Compose la reemplaza por db:5432. La API arranca sin BD y ready informa 503.
`get_db` entrega una sesión por request; cada futuro caso de uso define su commit explícito,
la sesión se cierra al terminar y el engine se libera al apagar la app.

La baseline Alembic no crea tablas financieras. Integrante 3 administra migraciones:

```sh
uv run --directory apps/api alembic heads
uv run --directory apps/api alembic upgrade head
uv run --directory apps/api alembic check
uv run --directory apps/api alembic revision --autogenerate -m "describe schema change"
```

Revisar toda migración generada antes de aplicarla. No usar `create_all()`.
El test PostgreSQL separado se omite si falta `TEST_DATABASE_URL`. CI lo configura con BD dedicada.
Para ejecutarlo localmente, apuntar esa variable a una BD de pruebas y usar `npm run test:api`.
