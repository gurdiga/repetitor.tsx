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

  Response:
    | {
        success: true;
      }
    | {
        error: "EMAIL_REQUIRED" | "PASSWORD_REQUIRED" | "FULL_NAME_REQUIRED" | "EMAIL_TAKEN" | "DB_ERROR";
      };
}
