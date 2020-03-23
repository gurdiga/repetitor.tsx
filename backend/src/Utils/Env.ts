import * as assert from "assert";

type EnvVarName =
  | "NODE_ENV"
  | "HEROKU_SLUG_COMMIT"
  | "APP_NAME"
  | "APP_URL"
  | "PORT"
  | "APP_DB_HOST"
  | "APP_DB_USER"
  | "APP_DB_PASSWORD"
  | "APP_DB_NAME"
  | "APP_SESSION_COOKIE_SECRET"
  | "APP_SMTP_HOST"
  | "APP_SMTP_PORT"
  | "APP_SMTP_USER"
  | "APP_SMTP_PASSWORD"
  | "APP_EMAIL_CONFIRMATION_MESSAGE_SENDER_ADDRESS"
  | "APP_ROLLBAR_POST_CLIENT_ITEM_TOKEN"
  | "APP_ROLLBAR_POST_SERVER_ITEM_TOKEN";

export function requireEnvVar(varName: EnvVarName): string {
  assert(varName in process.env, `Env var is missing: ${varName}`);

  return process.env[varName]!;
}

export function requireNumericEnvVar(varName: EnvVarName): number {
  const n = parseInt(requireEnvVar(varName), 10);

  assert(!isNaN(n), `Expected env var ${varName} to be a number, not ${n}`);

  return n;
}

export function isDevelopmentEnvironment(): boolean {
  return requireEnvVar("NODE_ENV") === "development";
}

export function isTestEnvironment(): boolean {
  return requireEnvVar("NODE_ENV") === "test";
}
