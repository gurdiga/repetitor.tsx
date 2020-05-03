import {Storage, UploadOptions} from "@google-cloud/storage";
import {requireEnvVar} from "backend/src/Utils/Env";
import * as fs from "fs";
import {IncomingHttpHeaders} from "http2";
import * as https from "https";
import {lookup} from "mime-types";

const configJson = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS_JSON");
const configFile = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS");

fs.writeFileSync(configFile, configJson);

const storage = new Storage();
const bucketName = requireEnvVar("GOOGLE_CLOUD_STORAGE_BUCKET_NAME");
const bucket = storage.bucket(bucketName);

const defaultUploadOptions = {
  gzip: true,
  metadata: {
    // cacheControl: "must-revalidate",
  },
};

export async function uploadFile(filename: string, options: UploadOptions = defaultUploadOptions) {
  const contentType = lookup(filename) || "binary/octet-stream";

  await bucket.upload(`./${filename}`, {
    ...options,
    contentType,
  });
}

export function getUploadedFileUrl(filename: string): URL {
  return new URL(`https://storage.googleapis.com/${bucketName}/${filename}`);
}

interface UploadedFile {
  body: string;
  headers: IncomingHttpHeaders;
}

export async function downloadFile(filename: string): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    https
      .get(getUploadedFileUrl(filename), (res) => {
        res.setEncoding("utf8");

        let body = "";

        res.on("data", (data) => (body += data));
        res.on("end", () => resolve({body, headers: res.headers}));
      })
      .on("error", reject);
  });
}
