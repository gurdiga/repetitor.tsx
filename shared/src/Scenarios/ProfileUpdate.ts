import {SystemError} from "shared/src/Model/Utils";
import {ProfileUpdated, NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";
import {FullNameError} from "shared/src/Model/Account";

export interface ProfileUpdateInput {
  fullName: string | undefined;
}

export type ProfileUpdateResult =
  | ProfileUpdated
  | NotAuthenticatedError
  | FullNameError
  | ProfileNotFoundError
  | SystemError;
