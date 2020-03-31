import {SystemError} from "shared/src/Model/Utils";
import {ProfileLoaded, NotAuthenticatedError} from "shared/src/Model/Profile";

export interface ProfileLoadInput {}

export type ProfileLoadResult = ProfileLoaded | NotAuthenticatedError | SystemError;
