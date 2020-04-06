export function classList(...args: (string | undefined)[]): string {
  return args.filter((x) => !!x).join(" ");
}
