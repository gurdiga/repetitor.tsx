export function camelCaseToUnderscore(string: string): string {
  return string.replace(/[A-Z]+/g, (match, ...rest) => {
    const offset = rest[rest.length - 2];
    const underscore = offset === 0 || string[offset - 1] === "_" ? "" : "_";

    return `${underscore}${match.toLowerCase()}`;
  });
}
