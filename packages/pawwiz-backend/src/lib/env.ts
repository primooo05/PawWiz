// Loads environment variables from the nearest `.env` file, searching upward
// from the current working directory. This lets a single monorepo-root `.env`
// serve every workspace, while still honoring a package-local `.env` if one
// exists closer by. When the process is launched via `infisical run --`, the
// injected variables already live in process.env and dotenv will not override
// them (dotenv never clobbers existing keys).
import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

function findEnvFile(startDir: string): string | undefined {
  let dir = startDir;
  // Walk up to the filesystem root looking for a `.env`.
  for (;;) {
    const candidate = resolve(dir, '.env');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return undefined; // reached the root
    dir = parent;
  }
}

const envPath = findEnvFile(process.cwd());
config(envPath ? { path: envPath } : undefined);
