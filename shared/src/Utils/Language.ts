export function assertNever(x: never): never {
  console.error("assertNever received this value", x);
  throw new Error("Unexpected code path for value: " + JSON.stringify(x));
}

export function pick<T, K extends keyof T>(obj: T, ...keys: K[]): Pick<T, K> {
  const picked = {};

  for (const key of keys) {
    (picked as any)[key] = obj[key];
  }

  return picked as Pick<T, K>;
}

export function omit<T, K extends keyof T>(obj: T, ...keys: K[]): Omit<T, K> {
  const picked = {};

  for (const key in obj) {
    if (keys.includes(key as any)) continue;

    (picked as any)[key] = obj[key];
  }

  return picked as Omit<T, K>;
}
