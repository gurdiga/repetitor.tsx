import {TutorRegistrationDTO, TutorRegistrationResult} from "shared/Scenarios/TutorRegistration";
import {TestScenarioDTO, TestScenarioResult} from "shared/Scenarios/TestScenario";
import {TutorLoginDTO, TutorLoginResult} from "shared/Scenarios/TutorLogin";
import {UserSession} from "shared/Model/UserSession";
import {LogoutDTO, LogoutResult} from "shared/Scenarios/Logout";

export interface ScenarioRegistry {
  TutorRegistration: {
    DTO: TutorRegistrationDTO;
    Result: TutorRegistrationResult;
  };
  TutorLogin: {
    DTO: TutorLoginDTO;
    Result: TutorLoginResult;
  };
  Logout: {
    DTO: LogoutDTO;
    Result: LogoutResult;
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
