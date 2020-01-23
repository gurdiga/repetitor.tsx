export type ActionName = keyof ActionRegistry;

export interface ActionRegistry {
  TestAction: TestAction;
  RegisterUser: RegisterUser;
}

interface Action {
  Params: object;
  Response: {rows: any[]} | {success: true} | {error: string};
}

interface TestAction extends Action {
  Params: {};
  Response: {rows: [{sum: number}]};
}

interface RegisterUser extends Action {
  Params: {
    email: string;
    password: string;
    fullName: string;
  };

  Response: SuccessResponse | PropErrorResponse | ModelErrorResponse | DbErrorResponse;
}

type PropErrorResponse = FullNameErrorResponse | EmailErrorResponse | PasswordErrorResponse;

type SuccessResponse = {success: true};

type FullNameErrorResponse = {
  fullNameError: true;
  error: FullNameValidationErrorCode;
};

export type FullNameValidationErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

type EmailErrorResponse = {
  emailError: true;
  error: EmailValidationErrorCode;
};

export type EmailValidationErrorCode = "REQUIRED" | "INCORRECT";

type PasswordErrorResponse = {
  passwordError: true;
  error: PasswordValidationErrorCode;
};

export type PasswordValidationErrorCode = "REQUIRED";

type DbErrorResponse = {
  dbError: true;
  error: DbValidationErrorCode;
};

export type DbValidationErrorCode = "ERROR";

type ModelErrorResponse = {
  modelError: true;
  error: ModelValidationErrorCode;
};

export type ModelValidationErrorCode = "EMAIL_TAKEN";
