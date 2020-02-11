import debug from "debug";

const logger = debug("app");

export function logError(...args: any[]): void {
  logger(args);
}
