import {Storage, StorageOptions, UploadOptions} from "@google-cloud/storage";
import {requireEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import * as fs from "fs";
import {CloudUploadError, StoreFileSuccess, UploadTempFileMissingErrorr} from "shared/src/Model/FileUpload";

writeConfigFile();

const bucketName = requireEnvVar("GOOGLE_CLOUD_STORAGE_BUCKET_NAME");
const storageOptions: StorageOptions = {
  autoRetry: true,
  maxRetries: 5,
};
// https://googleapis.dev/nodejs/storage/4.7.0/ ; check the precise version in package.json
const bucket = new Storage(storageOptions).bucket(bucketName);

const defaultUploadOptions = {
  // gzip: true, // For images it makes very little sense because they are already compressed.
  metadata: {
    cacheControl: "must-revalidate",
  },
};

export async function storeFile(
  sourceFile: string,
  destinationFileName: string,
  contentType: string,
  options: UploadOptions = defaultUploadOptions
): Promise<StoreFileSuccess | UploadTempFileMissingErrorr | CloudUploadError> {
  if (!fs.existsSync(sourceFile)) {
    logError(new Error(`UploadTempFileMissingErrorr: ${sourceFile}`));

    return {
      kind: "UploadTempFileMissingErrorr",
    };
  }

  try {
    await bucket.upload(sourceFile, {
      destination: destinationFileName,
      ...defaultUploadOptions,
      ...options,
      contentType,
    });

    return {
      kind: "StoreFileSuccess",
      url: getStoredFileUrl(destinationFileName),
    };
  } catch (e) {
    logError(e);

    return {
      kind: "CloudUploadError",
    };
  }
}

export async function deleteStoredFile(destinationFileName: string): Promise<void> {
  try {
    await bucket.deleteFiles({prefix: destinationFileName});
  } catch (error) {
    logError(error);
  }
}

export function getStoredFileUrl(filename: string): string {
  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

export function deleteTemFile(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch (error) {
    logError(error);
  }
}

function writeConfigFile() {
  const configJson = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS_JSON");
  const configFile = requireEnvVar("GOOGLE_APPLICATION_CREDENTIALS");

  fs.writeFileSync(configFile, configJson);
}
