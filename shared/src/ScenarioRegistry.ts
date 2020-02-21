import {TutorRegistrationInput, TutorRegistrationResult} from "shared/Scenarios/TutorRegistration";
import {TestScenarioInput, TestScenarioResult} from "shared/Scenarios/TestScenario";
import {TutorLoginInput, TutorLoginResult} from "shared/Scenarios/TutorLogin";
import {UserSession} from "shared/Model/UserSession";
import {LogoutInput, LogoutResult} from "shared/Scenarios/Logout";

export type SimpleScenarioName = "TestScenario";
export type SessionAlteringScenarioName = "TutorRegistration" | "TutorLogin" | "Logout";

export interface ScenarioRegistry {
  TutorRegistration: {
    Input: TutorRegistrationInput;
    Result: TutorRegistrationResult;
  };
  TutorLogin: {
    Input: TutorLoginInput;
    Result: TutorLoginResult;
  };
  Logout: {
    Input: LogoutInput;
    Result: LogoutResult;
  };
  TestScenario: {
    Input: TestScenarioInput;
    Result: TestScenarioResult;
  };
}

export type ScenarioName = keyof ScenarioRegistry;
export type ScenarioHandler<I, R> = SimpleScenarioHandler<I, R> | SessionAlteringScenarioHandler<I, R>;

export type SimpleScenarioHandler<I, R> = (scenarioInput: I) => Promise<R>;
export type SessionAlteringScenarioHandler<I, R> = (scenarioInput: I, session: UserSession) => Promise<R>;
