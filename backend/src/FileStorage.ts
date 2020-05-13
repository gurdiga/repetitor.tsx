import {Storage, StorageOptions, UploadOptions} from "@google-cloud/storage";
import {requireEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import * as fs from "fs";
import {IncomingHttpHeaders} from "http2";
import * as https from "https";
import {
  CantDeleteTempFileError,
  CloudUploadError,
  DeletedTempFile,
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
  // gzip: true, // For images it makes very little sense because they are already compressed.
  metadata: {
    cacheControl: "must-revalidate",
  },
};

export async function uploadFile(
  sourceFile: string,
  fileName: string,
  contentType: string,
  options: UploadOptions = defaultUploadOptions
): Promise<UploadFileSuccess | UploadSourceFileMissingErrorr | CloudUploadError> {
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

    return {
      kind: "UploadFileSuccess",
      url: getUploadedFileUrl(fileName),
    };
  } catch (e) {
    logError(e);

    return {
      kind: "CloudUploadError",
    };
  }
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

export function deleteTemFile(filePath: string): DeletedTempFile | CantDeleteTempFileError {
  try {
    fs.unlinkSync(filePath);

    return {
      kind: "DeletedTempFile",
    };
  } catch (error) {
    logError(error);

    return {
      kind: "CantDeleteTempFileError",
    };
  }
}
