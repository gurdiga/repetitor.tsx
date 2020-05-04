import {isTestEnvironment, requireEnvVar} from "backend/src/Env";
import {NextFunction, Request, Response} from "express";
import * as Rollbar from "rollbar";

const rollbar = new Rollbar({
  accessToken: requireEnvVar("APP_ROLLBAR_POST_SERVER_ITEM_TOKEN"),
  captureUncaught: true,
  captureUnhandledRejections: true,
  codeVersion: requireEnvVar("HEROKU_SLUG_COMMIT"),
  environment: requireEnvVar("NODE_ENV"),
  verbose: true,
});

export function errorLoggingMiddleware(
  err: Error,
  request: Request<any>,
  response: Response,
  next: NextFunction
): void {
  rollbar.errorHandler()(err, request, response, next);
}

export function logError(...args: any[]): void {
  if (isTestEnvironment()) {
    console.error(...args);
  }

  rollbar.error(...args);
}
