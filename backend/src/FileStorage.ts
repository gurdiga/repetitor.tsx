import {Storage, UploadOptions} from "@google-cloud/storage";
import {requireEnvVar} from "backend/src/Env";
import * as fs from "fs";
import {IncomingHttpHeaders} from "http2";
import * as https from "https";
import assert = require("assert");

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

export async function uploadFile(
  sourceFile: string,
  fileName: string,
  contentType: string,
  options: UploadOptions = defaultUploadOptions
) {
  // TODO: return CloudUploadError if this fails, and log the error
  await bucket.upload(sourceFile, {
    destination: fileName,
    ...defaultUploadOptions,
    ...options,
    contentType,
  });

  // TODO: return CloudUploadVerificationError if this fails, and log the error
  await verifyUpload(sourceFile, fileName);
}

async function verifyUpload(sourceFile: string, fileName: string): Promise<void> {
  const {body: downloadedFileContents} = await downloadFile(fileName);
  const actualFileContents = await fs.promises.readFile(sourceFile, {encoding: "utf-8"});

  assert(downloadedFileContents == actualFileContents, "Expected downloadedFileContents == actualFileContents");
}

export function getUploadedFileUrl(filename: string): URL {
  return new URL(`https://storage.googleapis.com/${bucketName}/${filename}`);
}

interface DownloadedFile {
  body: string;
  headers: IncomingHttpHeaders;
}

export async function downloadFile(filename: string): Promise<DownloadedFile> {
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
