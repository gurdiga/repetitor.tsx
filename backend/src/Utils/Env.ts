import * as assert from "assert";

export function assertEnvVars(varNames: string[]) {
  const missingVars = varNames.filter(name => !(name in process.env)).join(", ");

  assert(missingVars.length === 0, `Env vars are missing: ${missingVars}`);
}

export function requireEnvVar(varName: string): string {
  assert(varName in process.env, `Env var is missing: ${varName}`);

  return process.env[varName]!;
}

export function requireNumericEnvVar(varName: string): number {
  const n = parseInt(requireEnvVar(varName), 10);

  assert(!isNaN(n), `Expected env var ${varName} to be a number, not ${n}`);

  return n;
}
