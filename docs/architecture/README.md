# Arquitectura — Fase 0

El producto previsto conecta fiat de origen → USDC → Stellar → fiat de destino.
Esta fase solo verifica infraestructura: no cotiza, custodia ni mueve fondos.

## Límites y recorrido

1. Next.js sirve la página en :3000. `page.tsx` y `layout.tsx` son Server Components.
2. `ConnectionStatus` es Client Component: hace fetch desde el navegador a :8000/api/v1/health.
3. FastAPI expone contratos OpenAPI, valida entradas y coordinará servicios de aplicación.
4. Los servicios futuros aplicarán reglas de dominio y usarán repositorios para persistir en PostgreSQL.
5. Solo los adaptadores en `integrations/` hablarán con proveedores externos.

El frontend no accede a PostgreSQL. Los endpoints no contienen reglas financieras.
Los repositorios no calculan comisiones. El dominio no depende de FastAPI, SQLAlchemy ni Pollar.
PostgreSQL será la fuente de verdad de estados internos y auditoría; una respuesta del proveedor
no equivale automáticamente a liquidación bancaria.

## Decisiones

- Un repositorio; npm workspaces solo para `apps/web`. Python tiene su propio proyecto uv.
- SQLAlchemy 2 síncrono y psycopg 3. Los endpoints con BD son `def` para usar el thread pool de FastAPI.
- Engine por ciclo de vida de aplicación; sesiones por request, cierre con context manager y dispose al apagar.
- Conexión diferida: API y health arrancan aunque la BD esté caída. Ready ejecuta `SELECT 1` con timeout de conexión.
- Compose espera `db: healthy` antes de API y `api: healthy` antes de web.
- Migraciones explícitas, nunca `create_all()` al iniciar ni autogeneración en producción.
- Pollar pendiente y deshabilitado; sin SDK ni llamadas externas. `STELLAR_NETWORK` solo acepta `testnet`.
- El estado de Pollar distingue credenciales presentes de integración implementada.
- El build de web no consulta API, BD, fuentes remotas ni proveedores financieros.
- No hay Redis, colas, microservicios adicionales ni contratos Soroban.

## Modelado a partir del Sprint 1

El integrante 3 administra modelos y todas las migraciones; acuerda dominio con integrante 2
antes de publicar contratos. Módulos previstos: usuarios, billeteras, destinatarios, remesas,
cotizaciones, transacciones y auditoría. No se crean tablas vacías para anticiparlos.

- Tablas `snake_case` en plural; restricciones con nombres estables mediante `Base.metadata`.
- PK con `Uuid(as_uuid=True)`, valor Python `uuid.uuid4`; FK y restricciones explícitas.
- Importes con `Numeric(precision, scale)` y `Decimal`. Elegir escala por moneda/activo y
  límites de negocio; transmitir como strings JSON. Nunca `float`, ni redondeos implícitos.
- Timestamps `DateTime(timezone=True)` en UTC; `created_at` y `updated_at` donde corresponda.
- Unicidad de referencias externas e idempotencia se diseñan antes de integrar pagos.
- Cada cambio de modelo requiere revisión del integrante 3, una migración y validación upgrade/downgrade.

## Referencias oficiales consultadas

- [Next.js: instalación](https://nextjs.org/docs/app/getting-started/installation).
- [uv: proyectos y locks](https://docs.astral.sh/uv/guides/projects/).
- [SQLAlchemy: sesiones](https://docs.sqlalchemy.org/en/20/orm/session_basics.html).
- [Alembic: tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html).
- [Compose: orden de arranque](https://docs.docker.com/compose/how-tos/startup-order/).
- [Stellar: redes](https://developers.stellar.org/docs/networks).
