import {
  BadFileTypeError,
  MAX_UPLOADED_FILE_SIZE,
  Upload,
  UploadedFile,
  UploadValidationError,
} from "shared/src/Model/FileUpload";
import {UnexpectedError} from "shared/src/Model/Utils";

export type AvatarUrl = {
  kind: "AvatarUrl";
  url: string;
};

export type AvatarImage = {
  kind: "AvatarImage";
  image: UploadedFile;
};

export type TooManyFilesError = {
  kind: "TooManyFilesError";
};

export type FileTooLargeError = {
  kind: "FileTooLargeError";
};

export const AVATAR_IMAGE_TYPE = "image/jpeg";
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function makeImageFromUpload(
  upload: Upload
): AvatarImage | UploadValidationError | BadFileTypeError | UnexpectedError {
  if (upload instanceof Array) {
    // ASSUMPTION: It’s an UploadedFile[]
    const [image] = upload;

    if (!image) {
      return {
        kind: "UploadMissingError",
      };
    }

    if (image.mimetype !== AVATAR_IMAGE_TYPE) {
      return {
        kind: "BadFileTypeError",
      };
    }

    return {
      kind: "AvatarImage",
      image,
    };
  } else if ("kind" in upload) {
    // ASSUMPTION: It’s an UploadValidationError.
    return upload;
  } else {
    throw new Error("Unexpected upload type");
  }
}

export function makeFileListFromInputElement(
  input: HTMLInputElement
): FileList | TooManyFilesError | BadFileTypeError | FileTooLargeError {
  const files = input.files as FileList;

  if (files.length > 1) {
    return {
      kind: "TooManyFilesError",
    };
  }

  const file = files.item(0) as File;

  if (file.type !== AVATAR_IMAGE_TYPE) {
    return {
      kind: "BadFileTypeError",
    };
  }

  if (file.size > MAX_AVATAR_SIZE || file.size > MAX_UPLOADED_FILE_SIZE) {
    return {
      kind: "FileTooLargeError",
    };
  }

  return files;
}
