import {isDevelopmentEnvironment, isTestEnvironment, requireEnvVar} from "backend/src/Env";
import {NextFunction, Request, Response} from "express";
import * as Rollbar from "rollbar";

const rollbarInstance = new Rollbar({
  accessToken: requireEnvVar("APP_ROLLBAR_POST_SERVER_ITEM_TOKEN"),
  captureUncaught: true,
  captureUnhandledRejections: true,
  codeVersion: requireEnvVar("HEROKU_SLUG_COMMIT"),
  environment: requireEnvVar("NODE_ENV"),
  transmit: !isDevelopmentEnvironment(), // Tests are also run by Heroku, and I want to know if something trows there.
  verbose: isTestEnvironment() || isDevelopmentEnvironment(),
});

const handler = rollbarInstance.errorHandler();

export function errorLoggingMiddleware(err: Error, req: Request, res: Response, next: NextFunction): void {
  handler(err, req, res, next);
}

export function logError(...args: Rollbar.LogArgument[]): void {
  rollbarInstance.error(...args);
}
