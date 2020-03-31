import {SystemError} from "shared/src/Model/Utils";
import {ProfileLoaded, NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";

export interface ProfileLoadInput {}

export type ProfileLoadResult = ProfileLoaded | NotAuthenticatedError | ProfileNotFoundError | SystemError;
