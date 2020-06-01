import {isObject} from "shared/src/Utils/Language";

export const UPLOADED_FILES_FORM_FIELD_NAME = "files";
export const MAX_UPLOADED_FILE_COUNT = 1;
export const MAX_UPLOADED_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadedFile {
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

export function isUploadedFile(value: UploadedFile): value is UploadedFile {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.originalname === "string" &&
    typeof value.path === "string" &&
    typeof value.mimetype === "string" &&
    typeof value.size === "number"
  );
}

export type UploadMissingError = {
  kind: "UploadMissingError";
};

// Signaled from uploadParser. Still needs to be properly handled on the front-end.
export type FileTooLargeError = {
  kind: "FileTooLargeError";
};

export type UnacceptableUploadError = {
  kind: "UnacceptableUploadError";
  error: string;
};

export type UploadTempFileMissingErrorr = {
  kind: "UploadTempFileMissingErrorr";
};

export type DeletedTempFile = {
  kind: "DeletedTempFile";
};

export type BadFileTypeError = {
  kind: "BadFileTypeError";
};

export type CloudUploadError = {
  kind: "CloudUploadError";
};

export type StoreFileSuccess = {
  kind: "StoreFileSuccess";
  url: string;
};

export type UploadValidationError = FileTooLargeError | UnacceptableUploadError | UploadMissingError;
export type UploadParsingResult = UploadedFile[] | UploadValidationError;
export type Upload = FileList | UploadParsingResult;

export interface UploadScenario {
  upload: Upload;
}
