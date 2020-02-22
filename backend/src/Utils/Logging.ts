import {Request, Response, NextFunction} from "express";
import * as Rollbar from "rollbar";
import {requireEnvVar} from "Utils/Env";

const rollbar = new Rollbar({
  accessToken: requireEnvVar("APP_ROLLBAR_POST_SERVER_ITEM_TOKEN"),
  captureUncaught: true,
  captureUnhandledRejections: true,
  codeVersion: "TODO",
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
  rollbar.error(...args);
}
