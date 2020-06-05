import {AvatarUrl} from "shared/src/Model/AvatarUpload";
import {
  BadFileTypeError,
  CloudUploadError,
  UploadScenario,
  UploadTempFileMissingErrorr,
  UploadValidationError,
} from "shared/src/Model/FileUpload";
import {NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface AvatarUploadInput extends UploadScenario {}

export type AvatarUploadResult =
  | AvatarUrl
  | NotAuthenticatedError
  | UploadValidationError
  | UploadTempFileMissingErrorr
  | BadFileTypeError
  | CloudUploadError
  | ProfileNotFoundError
  | SystemError;
