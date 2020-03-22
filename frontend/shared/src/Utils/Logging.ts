import * as Rollbar from "rollbar";

declare const environment: "test";
declare const rollbar: Rollbar;

export function logError(...args: any[]): void {
  if (environment === "test") {
    console.error(...args);
  }

  rollbar.error(...args);
}
