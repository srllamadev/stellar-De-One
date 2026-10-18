import { copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
for (const [source, target] of [
  [".env.example", ".env"],
  ["apps/web/.env.example", "apps/web/.env.local"],
  ["apps/api/.env.example", "apps/api/.env"],
]) {
  if (existsSync(resolve(root, target))) {
    console.log(`Conservado: ${target}`);
  } else {
    copyFileSync(resolve(root, source), resolve(root, target));
    console.log(`Creado con valores locales de ejemplo: ${target}`);
  }
}
