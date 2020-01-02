export interface ActionRegistry {
  RegisterUser: RegisterUser;
  TestAction: {};
}

export type ActionName = keyof ActionRegistry;

interface RegisterUser extends Action {
  Params: {
    email: string;
    password: string;
    fullName: string;
  };
  Response: {
    success: true;
  };
}

interface Action {
  Params: {};
  Response: {};
}
