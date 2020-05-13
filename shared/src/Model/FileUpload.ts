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
export type FileTooLargeError = {
  kind: "FileTooLargeError";
};

export type UploadSourceFileMissingErrorr = {
  kind: "UploadSourceFileMissingErrorr";
};

export type CantDeleteTempFileError = {
  kind: "CantDeleteTempFileError";
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

export type CloudUploadVerificationError = {
  kind: "CloudUploadVerificationError";
};

export type UploadFileSuccess = {
  kind: "UploadFileSuccess";
  url: URL;
};
