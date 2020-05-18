import {BadFileTypeError, Upload, UploadedFile, UploadValidationError} from "shared/src/Model/FileUpload";
import {UnexpectedError} from "shared/src/Model/Utils";

export type AvatarUrl = {
  kind: "AvatarUrl";
  url: URL;
};

export type AvatarImage = {
  kind: "AvatarImage";
  image: UploadedFile;
};

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

    if (image.mimetype !== "image/jpeg") {
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
