import {TutorRegistrationInput, TutorRegistrationResult} from "shared/src/Scenarios/TutorRegistration";
import {TestScenarioInput, TestScenarioResult} from "shared/src/Scenarios/TestScenario";
import {TutorLoginInput, TutorLoginResult} from "shared/src/Scenarios/TutorLogin";
import {UserSession} from "shared/src/Model/UserSession";
import {LogoutInput, LogoutResult} from "shared/src/Scenarios/Logout";
import {
  TutorPasswordResetStep1Input,
  TutorPasswordResetStep1Result,
} from "shared/src/Scenarios/TutorPasswordResetStep1";
import {
  TutorPasswordResetStep2Input,
  TutorPasswordResetStep2Result,
} from "shared/src/Scenarios/TutorPasswordResetStep2";
import {EmailConfirmationInput, EmailConfirmationResult} from "shared/src/Scenarios/EmailConfirmation";
import {ProfileLoadInput, ProfileLoadResult} from "shared/src/Scenarios/ProfileLoad";

export type SimpleScenarioName = "TestScenario" | "TutorPasswordResetStep1" | "ProfileLoad";
export type SessionAlteringScenarioName =
  | "TutorRegistration"
  | "TutorLogin"
  | "Logout"
  | "TutorPasswordResetStep2"
  | "EmailConfirmation";

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
  TutorPasswordResetStep1: {
    Input: TutorPasswordResetStep1Input;
    Result: TutorPasswordResetStep1Result;
  };
  TutorPasswordResetStep2: {
    Input: TutorPasswordResetStep2Input;
    Result: TutorPasswordResetStep2Result;
  };
  EmailConfirmation: {
    Input: EmailConfirmationInput;
    Result: EmailConfirmationResult;
  };
  ProfileLoad: {
    Input: ProfileLoadInput;
    Result: ProfileLoadResult;
  };
}

export type ScenarioName = keyof ScenarioRegistry;
export type ScenarioHandler<I, R> = SimpleScenarioHandler<I, R> | SessionAlteringScenarioHandler<I, R>;

export type SimpleScenarioHandler<I, R> = (scenarioInput: I) => Promise<R>;
export type SessionAlteringScenarioHandler<I, R> = (scenarioInput: I, session: UserSession) => Promise<R>;
