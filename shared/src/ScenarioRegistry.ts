import {UserRegistrationDTO, UserRegistrationResult} from "shared/Scenarios/UserRegistration";
import {TestScenarioDTO, TestScenarioResult} from "shared/Scenarios/TestScenario";
import {TutorLoginDTO, TutorLoginResult} from "shared/Scenarios/TutorLogin";
import {UserSession} from "shared/Model/UserSession";

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
export type ScenarioHandler<DTO, R> = SimpleScenarioHandler<DTO, R> | SessionAlteringScenarioHandler<DTO, R>;

export type SimpleScenarioHandler<DTO, R> = (dto: DTO) => Promise<R>;
export type SessionAlteringScenarioHandler<DTO, R> = (dto: DTO, session: UserSession) => Promise<R>;
