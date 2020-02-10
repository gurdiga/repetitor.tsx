import {SystemError} from "shared/Model/Utils";
import {EmailError} from "shared/Model/Email";
import {PasswordError} from "shared/Model/Password";
import {LoginCheckSuccess, LoginCheckError} from "shared/Model/LoginCheck";

export interface TutorLoginDTO {
  email?: string;
  password?: string;
}

type DTOError = EmailError | PasswordError;

export type TutorLoginResult = LoginCheckSuccess | LoginCheckError | DTOError | SystemError;
