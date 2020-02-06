import {UserRegistrationDTO, UserRegistrationResult} from "shared/Scenarios/UserRegistration";
import {TestScenarioDTO, TestScenarioResult} from "shared/Scenarios/TestScenario";
import {TutorLoginDTO, TutorLoginResult} from "shared/Scenarios/TutorLogin";

export interface ScenarioRegistry {
  UserRegistration: {
    DTO: UserRegistrationDTO;
    Result: UserRegistrationResult;
  };
  TutorLogin: {
    DTO: TutorLoginDTO;
    Result: TutorLoginResult;
  };
  TestScenario: {
    DTO: TestScenarioDTO;
    Result: TestScenarioResult;
  };
}

export type ScenarioName = keyof ScenarioRegistry;
export type ScenarioHandler<P, R> = (params: P) => Promise<R>;
