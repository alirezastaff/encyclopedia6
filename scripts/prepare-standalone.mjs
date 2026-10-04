import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";

const standaloneDir = join(".next", "standalone");

for (const [source, destination] of [
  ["public", join(standaloneDir, "public")],
  [join(".next", "static"), join(standaloneDir, ".next", "static")],
]) {
  if (existsSync(source)) {
    cpSync(source, destination, { recursive: true });
  }
}