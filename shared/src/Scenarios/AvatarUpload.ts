import {AvatarUrl} from "shared/src/Model/AvatarUpload";
import {
  BadFileTypeError,
  CantDeleteTempFileError,
  CloudUploadError,
  FileTooLargeError,
  TooManyFilesError,
  UploadSourceFileMissingErrorr,
} from "shared/src/Model/FileUpload";
import {NotAuthenticatedError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface AvatarUploadInput {}

export type AvatarUploadResult =
  | AvatarUrl
  | NotAuthenticatedError
  | TooManyFilesError
  | UploadSourceFileMissingErrorr
  | BadFileTypeError
  | FileTooLargeError
  | CloudUploadError
  | CantDeleteTempFileError
  | SystemError;
