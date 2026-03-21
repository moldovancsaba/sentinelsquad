/** Read `SOVEREIGN_*` (and other single-key) environment variables. */
export function sovereignEnv(name: string): string | undefined {
  const v = process.env[name];
  if (v !== undefined && v !== "") return v;
  return undefined;
}

export function sovereignEnvDefault(name: string, fallback: string): string {
  return sovereignEnv(name) ?? fallback;
}
