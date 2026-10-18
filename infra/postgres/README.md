# PostgreSQL local

Compose administra PostgreSQL 17, puerto host 5433 → contenedor 5432 y volumen postgres_data.
No hay scripts init ni tablas financieras: Alembic administra el esquema.
Cambiar credenciales en .env raíz requiere actualizar DATABASE_URL del host en apps/api/.env.
Cambiar POSTGRES_* no cambia usuarios de un volumen ya inicializado: usar SQL administrativo
para actualizar credenciales o crear un volumen nuevo si los datos son descartables.
`npm run db:down` solo detiene db; conserva datos. No borrar volúmenes para resolver fallos sin revisar su contenido.
