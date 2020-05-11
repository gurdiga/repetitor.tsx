import {AvatarUrl} from "shared/src/Model/AvatarUpload";
import {
  BadFileTypeError,
  CantDeleteTempFileError,
  CloudUploadError,
  CloudUploadVerificationError,
  FileTooLargeErrorr,
  FileUploadMissingErrorr,
  TempFileNotFoundError,
  TooManyFilesError,
} from "shared/src/Model/FileUpload";
import {NotAuthenticatedError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface AvatarUploadInput {}

export type AvatarUploadResult =
  | AvatarUrl
  | NotAuthenticatedError
  | TooManyFilesError
  | FileUploadMissingErrorr
  | BadFileTypeError
  | FileTooLargeErrorr
  | TempFileNotFoundError
  | CloudUploadError
  | CloudUploadVerificationError
  | CantDeleteTempFileError
  | SystemError;
