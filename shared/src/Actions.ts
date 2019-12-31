type ActionName = keyof ActionRegistry;

interface ActionRegistry {
  RegisterUser: RegisterUser;
  TestAction: {};
}

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
