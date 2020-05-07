import {UploadedFile} from "shared/src/Model/UploadedFile";

export type AvatarUrl = {
  kind: "AvatarUrl";
  url: URL;
};

// Can be signaled from uploadParser. Still needs to be properly handled on the front-end.
export type TooManyFilesError = {
  kind: "TooManyFilesError";
  fileCount: number;
};

// Signaled from uploadParser. Still needs to be properly handled on the front-end.
export type FileTooLargeErrorr = {
  kind: "FileTooLargeErrorr";
};

export type FileMissingErrorr = {
  kind: "FileMissingErrorr";
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

export type AvatarImage = {
  kind: "AvatarImage";
  image: UploadedFile;
};

export type CloudUploadError = {
  kind: "CloudUploadError";
};

export function makeImageFromUploadedFiles(
  uploadedFiles: UploadedFile[]
): AvatarImage | FileMissingErrorr | BadFileTypeError {
  const [image] = uploadedFiles;

  if (!image) {
    return {
      kind: "FileMissingErrorr",
    };
  }

  if (image.mimetype !== "image/jpeg") {
    return {
      kind: "BadFileTypeError",
    };
  }

  return {
    kind: "AvatarImage",
    image,
  };
}
