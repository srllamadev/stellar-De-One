# Colaboración de tres integrantes

## Clonar y preparar

```sh
git clone https://github.com/srllamadev/stellar-De-One.git
cd stellar-De-One
npm install
uv sync --directory apps/api --frozen
npm run setup
```

El nombre remoto histórico es stellar-De-One; el nombre técnico del producto es remesas-latam.
Requisitos y modos de ejecución: README raíz. No crear un Git dentro de apps ni un workspace npm para Python.

## Ramas, commits y PR

`main` es la rama principal. Convenciones iniciales solicitadas:

- `feat/frontend`: integrante 1.
- `feat/backend`: integrante 2.
- `feat/database-devops`: integrante 3.

Crear la rama al empezar trabajo real: `git switch -c feat/frontend`. Para tareas posteriores,
preferir ramas pequeñas con alcance, por ejemplo `feat/frontend-status`.
No se crearon ramas ni commits ficticios durante el bootstrap.

Antes de cambiar: `git status`, actualizar main con `git pull --ff-only`, crear rama.
Commits pequeños con Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`.
Ejemplo: `git commit -m "feat: add recipient API contract"`.
Abrir PR a main con problema, cambio, validación y migraciones si aplica. Ejecutar `npm run verify`;
CI agrega PostgreSQL y Compose. Evitar fusionar con CI fallido. Configurar protección de main
en GitHub cuando el equipo tenga permisos (no se ha cambiado configuración remota).

## Responsabilidades y coordinación obligatoria

| Integrante | Área principal |
|---|---|
| 1 — Frontend | apps/web/ |
| 2 — Backend | apps/api/app/api/, services/, domain/, integrations/, schemas/, core/ |
| 3 — BD y DevOps | models/, repositories/, alembic/, infra/, compose.yaml, .github/workflows/ |

El integrante 3 administra las migraciones. El integrante 2 acuerda modelos de dominio
con el integrante 3. El integrante 1 consume contratos API definidos y documentados.
Nadie modifica código de otra área sin comunicarlo y acordarlo con su responsable.
Los archivos compartidos (package.json, locks, configuración, contratos y documentación)
requieren coordinación y revisión de las personas afectadas.

## Dependencias y conflictos

- JavaScript: instalar desde raíz con `npm install <paquete> --workspace @remesas/web`;
  versionar package-lock.json. En CI usar npm ci.
- Python: `uv add --directory apps/api <paquete>` o `--dev`; versionar pyproject.toml y uv.lock.
- No editar locks a mano ni instalar globalmente dependencias de aplicación.
- Para conflictos: actualizar la rama con main, revisar cada cambio con su propietario,
  resolver fuentes primero y regenerar el lock con la herramienta correspondiente.
  Ejecutar verificaciones antes de completar merge/rebase. Nunca descartar el área de otra persona a ciegas.
- Una sola persona crea/reordena migraciones por PR; comprobar `alembic heads` y acordar
  el orden antes de fusionar ramas con cambios de esquema.
- No subir .env, seeds, dumps, PII ni credenciales; usar .env.example sin secretos reales.
