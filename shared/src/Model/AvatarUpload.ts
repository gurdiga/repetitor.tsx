import {BadFileTypeError, FileUploadMissingErrorr, UploadedFile} from "shared/src/Model/FileUpload";

export type AvatarUrl = {
  kind: "AvatarUrl";
  url: URL;
};

export type AvatarImage = {
  kind: "AvatarImage";
  image: UploadedFile;
};

export function makeImageFromUploadedFiles(
  uploadedFiles: UploadedFile[]
): AvatarImage | FileUploadMissingErrorr | BadFileTypeError {
  const [image] = uploadedFiles;

  if (!image) {
    return {
      kind: "FileUploadMissingErrorr",
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
