import {Storage, StorageOptions, UploadOptions} from "@google-cloud/storage";
import {requireEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import * as fs from "fs";
import {IncomingHttpHeaders} from "http2";
import * as https from "https";
import {
  CloudUploadError,
  CloudUploadVerificationError,
  UploadFileSuccess,
  UploadSourceFileMissingErrorr,
} from "shared/src/Model/FileUpload";
import assert = require("assert");

writeConfigFile();

const bucketName = requireEnvVar("GOOGLE_CLOUD_STORAGE_BUCKET_NAME");
const storageOptions: StorageOptions = {
  autoRetry: true,
  maxRetries: 5,
};
const bucket = new Storage(storageOptions).bucket(bucketName);

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
): Promise<UploadFileSuccess | UploadSourceFileMissingErrorr | CloudUploadError | CloudUploadVerificationError> {
  if (!fs.existsSync(sourceFile)) {
    return {
      kind: "UploadSourceFileMissingErrorr",
    };
  }

  try {
    await bucket.upload(sourceFile, {
      destination: fileName,
      ...defaultUploadOptions,
      ...options,
      contentType,
    });

    try {
      await verifyUpload(sourceFile, fileName);
    } catch (e) {
      logError(e);

      return {
        kind: "CloudUploadVerificationError",
      };
    }
  } catch (e) {
    logError(e);

    return {
      kind: "CloudUploadError",
    };
  }

  return {
    kind: "UploadFileSuccess",
  };
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

function writeConfigFile() {
  const configJson = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  const configFile = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS");

  fs.writeFileSync(configFile, configJson);
}
