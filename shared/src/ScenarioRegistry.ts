import {UserRegistrationDTO, UserRegistrationResult} from "shared/Scenarios/UserRegistration";
import {TestScenarioDTO, TestScenarioResult} from "shared/Scenarios/TestScenario";

export interface ScenarioRegistry {
  UserRegistration: {
    DTO: UserRegistrationDTO;
    Result: UserRegistrationResult;
  };
  TestScenario: {
    DTO: TestScenarioDTO;
    Result: TestScenarioResult;
  };
}

export type ScenarioName = keyof ScenarioRegistry;
export type ScenarioHandler<P, R> = (params: P) => Promise<R>;
