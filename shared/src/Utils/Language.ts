export function assertNever(x: never): never {
  console.error("assertNever received this value", x);
  throw new Error("Unexpected code path for value: " + JSON.stringify(x));
}
