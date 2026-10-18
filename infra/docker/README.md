# Desarrollo en contenedores

Compose raíz define web, api y db. Los Dockerfiles de apps son de desarrollo, con recarga
y sin optimizaciones ni endurecimiento de producción. Red privada remesas; puertos publicados solo en loopback.
La URL de BD en API usa db:5432. La URL pública de API en el navegador usa localhost:8000.
No usar http://api:8000 en NEXT_PUBLIC_API_URL: ese hostname no existe en el navegador del host.

`docker compose up --build` inicia todos. `docker compose config --quiet` valida Compose.
`docker compose exec api uv run --no-sync alembic upgrade head` aplica la baseline explícitamente.
Código web src/public y API app/alembic se monta para recarga; cambios de dependencias o configuración
requieren rebuild. La red y el volumen usan el nombre de proyecto remesas-latam.
