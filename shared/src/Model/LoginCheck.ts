import {DataProps} from "shared/Model/Utils";
import {TutorLoginDTO} from "shared/Scenarios/TutorLogin";
import {EmailError, UserEmailValidationRules} from "shared/Model/Email";
import {PasswordError, UserPasswordValidationRules} from "shared/Model/Password";
import {validateWithRules, PredicateFn} from "shared/Utils/Validation";
import {UserSession} from "shared/Model/UserSession";

export interface LoginCheck {
  kind: "LoginCheck";
  email: string;
  password: string;
}

export type LoginCheckPropName = keyof DataProps<LoginCheck>;

export type LoginCheckSuccess = {
  kind: "LoginCheckSuccess";
};

export type LoginCheckInfo = {
  kind: "LoginCheckInfo";
  userId: UserSession["userId"];
};

export type LoginCheckError = UnknownEmailError | IncorrectPasswordError;

export type UnknownEmailError = {
  kind: "UnknownEmailError";
};

export type IncorrectPasswordError = {
  kind: "IncorrectPasswordError";
};

export type LoginCheckPropError = EmailError | PasswordError;

export function makeLoginCkeckFromLoginDTO(loginDTO: TutorLoginDTO): LoginCheck | LoginCheckPropError {
  const emailValidationResult = validateWithRules(loginDTO.email, LoginCheckValidationRules.email);

  if (emailValidationResult.kind === "Invalid") {
    return {kind: "EmailError", errorCode: emailValidationResult.validationErrorCode};
  }

  const passwordValidationResult = validateWithRules(loginDTO.password, LoginCheckValidationRules.password);

  if (passwordValidationResult.kind === "Invalid") {
    return {kind: "PasswordError", errorCode: passwordValidationResult.validationErrorCode};
  }

  return {
    kind: "LoginCheck",
    email: emailValidationResult.value,
    password: passwordValidationResult.value,
  };
}

const LoginCheckValidationRules: Record<LoginCheckPropName, Record<any, PredicateFn>> = {
  email: UserEmailValidationRules,
  password: UserPasswordValidationRules,
};
