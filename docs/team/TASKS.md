# Backlog inicial — Sprint 1

Antes de desarrollar flujos, acordar un corredor de prueba, alcance y contratos OpenAPI.
Autenticación y operaciones financieras siguen pendientes; no prometer una remesa terminada.

## Integrante 1 — Frontend

Área: `apps/web/`.

- Diseño responsive y sistema de componentes reutilizables.
- Diseñar estados de autenticación y coordinar contrato con backend.
- Dashboard, flujo de remesas e historial a partir de endpoints acordados.
- Integración cliente Pollar solo tras validar SDK y acceso Testnet.
- Estados de error, carga, accesibilidad y pruebas de interacción.

## Integrante 2 — Backend

Áreas: `apps/api/app/api/`, `services/`, `domain/`, `integrations/`; coordinación de `schemas/` y `core/`.

- Definir contratos OpenAPI y autenticación backend con permisos.
- Modelar usuarios, cotizaciones y ciclo de vida de remesas junto al integrante 3.
- Validación de operaciones, idempotencia y estados de error explícitos.
- Verificar capacidades financieras por proveedor y corredor antes de escribir adaptadores.
- Prueba Testnet con hash verificable; no activar fiat sin sandbox confirmado.

## Integrante 3 — Base de datos y DevOps

Áreas: `apps/api/app/models/`, `repositories/`, `alembic/`, `infra/`, `compose.yaml`, `.github/workflows/`.

- Instalar Docker local y ejecutar el smoke completo con PostgreSQL.
- Administrar todas las migraciones y acordar modelos con integrante 2.
- Modelo relacional: usuarios, billeteras, destinatarios, remesas, cotizaciones, transacciones, auditoría.
- Repositorios, restricciones e índices para persistencia y conciliación.
- CI/CD, protección de ramas y estrategia de backups cuando corresponda.
- Soporte de infraestructura Testnet Pollar sin publicar secretos.

## Acuerdos compartidos

Integrante 1 consume contratos definidos y documentados. Integrante 2 y 3 acuerdan dominio
y persistencia. Integrante 3 es el administrador de migraciones. Archivos compartidos requieren
coordinación. Nadie modifica otra área sin comunicarlo y acordarlo.
Cada tarea se entrega en PR pequeño con evidencia de pruebas y sin datos reales.
