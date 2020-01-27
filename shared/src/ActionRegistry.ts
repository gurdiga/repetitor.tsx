import {UserResult} from "shared/Domain/User";
import {RegistrationFormDTO} from "shared/Scenarios/UserRegistration";
import {TestActionParams, TestActionResponse} from "shared/Scenarios/TestAction";

export type ActionName = keyof ActionRegistry;

export interface ActionRegistry {
  TestAction: {
    Params: TestActionParams;
    Response: TestActionResponse;
  };

  RegisterUser: {
    Params: RegistrationFormDTO;
    Response: UserResult;
  };
}
