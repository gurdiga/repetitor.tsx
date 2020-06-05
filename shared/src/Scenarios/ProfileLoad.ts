import {ClientSideProfile, NotAuthenticatedError, ProfileNotFoundError} from "shared/src/Model/Profile";
import {SystemError} from "shared/src/Model/Utils";

export interface ProfileLoadInput {}

export type ProfileLoadResult = ClientSideProfile | NotAuthenticatedError | ProfileNotFoundError | SystemError;
