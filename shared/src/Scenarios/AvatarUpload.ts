import {
  AvatarUrl,
  BadFileTypeError,
  CantDeleteTempFileError,
  CloudUploadError,
  FileMissingErrorr,
  FileTooLargeErrorr,
  TempFileNotFoundError,
  TooManyFilesError,
} from "shared/src/Model/AvatarUpload";
import {NotAuthenticatedError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface AvatarUploadInput {}

export type AvatarUploadResult =
  | AvatarUrl
  | NotAuthenticatedError
  | TooManyFilesError
  | FileMissingErrorr
  | BadFileTypeError
  | FileTooLargeErrorr
  | TempFileNotFoundError
  | CloudUploadError
  | CantDeleteTempFileError
  | SystemError;
