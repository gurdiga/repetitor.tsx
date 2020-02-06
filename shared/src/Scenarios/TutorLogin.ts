import {Success, DbError, UnexpectedError} from "shared/Model/Utils";
import {EmailError, PasswordError} from "shared/Model/User";

export interface TutorLoginDTO {
  email?: string;
  password?: string;
}

type DTOError = EmailError | PasswordError;

export type TutorLoginResult = Success | DTOError | DbError | UnexpectedError;
