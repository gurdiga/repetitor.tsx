import * as crypto from "crypto";

export function hashString(string: string, salt: string): string {
  return crypto
    .createHmac("sha256", salt)
    .update(string)
    .digest("hex");
}

export function genRandomString(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}
