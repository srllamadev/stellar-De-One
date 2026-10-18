# Web Next.js

App Router con TypeScript, Tailwind CSS 4, ESLint, src/ y alias @/*.
Desde raíz: `npm install`, `npm run setup`, `npm run dev:web`.
Abrir http://localhost:3000 con la API en :8000 para comprobar la conexión.

`src/app` contiene Server Components. `src/components/connection-status.tsx` es cliente y consulta
health por fetch mediante `src/lib/api`; valida contrato, timeout y cancelación.
La pantalla nunca consulta BD o Pollar en build ni simula remesas.

`apps/web/.env.local` contiene las variables públicas de `.env.example`. API URL debe ser
accesible desde el navegador, normalmente http://localhost:8000, incluso con Docker.
Reiniciar dev o reconstruir tras cambiar NEXT_PUBLIC_*. Jamás añadir secretos aquí.
Pollar no está instalado ni habilitado: `src/lib/pollar/config.ts` informa configuración pendiente.

`src/features/*` separa futuras áreas funcionales. `components/ui`, `components/layout`,
`hooks`, `providers` y `types` están reservados con responsabilidades documentadas.
No crear formularios financieros o autenticación productiva durante esta fase.

Verificar desde raíz: `npm run lint:web`, `npm run typecheck:web`, `npm run build:web`.
Los tipos de Next se generan antes de TypeScript para que funcione desde un clon limpio.
El build no descarga fuentes Google: usa tipografía del sistema para ser reproducible sin ese servicio.
