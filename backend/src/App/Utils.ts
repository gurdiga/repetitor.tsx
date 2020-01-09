import assert from "assert";

export function assertEnvVars(varNames: string[]) {
  const missingVars = varNames.filter(name => !(name in process.env)).join(", ");

  assert(missingVars.length === 0, `Env vars are missing: ${missingVars}`);
}
