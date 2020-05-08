export const UPLOADED_FILES_FORM_FIELD_NAME = "files";
export const MAX_UPLOADED_FILE_COUNT = 1;
export const MAX_UPLOADED_FILE_SIZE = 5 * 1024 * 1024;

export interface UploadedFile {
  originalname: string;
  path: string;
  mimetype: string;
  size: number;
}

// Can be signaled from uploadParser. Still needs to be properly handled on the front-end.
export type TooManyFilesError = {
  kind: "TooManyFilesError";
  fileCount: number;
};

// Signaled from uploadParser. Still needs to be properly handled on the front-end.
export type FileTooLargeErrorr = {
  kind: "FileTooLargeErrorr";
};

export type FileUploadMissingErrorr = {
  kind: "FileUploadMissingErrorr";
};

export type TempFileNotFoundError = {
  kind: "TempFileNotFoundError";
};

export type CantDeleteTempFileError = {
  kind: "CantDeleteTempFileError";
};

export type BadFileTypeError = {
  kind: "BadFileTypeError";
};

export type CloudUploadError = {
  kind: "CloudUploadError";
};

export type CloudDownloadError = {
  kind: "CloudDownloadError";
};
