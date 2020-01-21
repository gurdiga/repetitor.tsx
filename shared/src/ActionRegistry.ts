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

  Response: SuccessResponse | EmailErrorResponse | FullNameErrorResponse | PasswordErrorResponse | DbErrorResponse;
}

type SuccessResponse = {success: true};

type EmailErrorResponse = {
  emailError: true;
  error: "REQUIRED" | "TAKEN" | "INVALID";
};

type FullNameErrorResponse = {
  fullNameError: true;
  error: "REQUIRED";
};

type PasswordErrorResponse = {
  passwordError: true;
  error: "REQUIRED";
};

type DbErrorResponse = {
  dbError: true;
  error: "ERROR";
};
