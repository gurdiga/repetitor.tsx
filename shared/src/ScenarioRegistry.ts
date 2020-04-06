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
import {ProfileUpdateInput, ProfileUpdateResult} from "shared/src/Scenarios/ProfileUpdate";

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
  ProfileUpdate: {
    Input: ProfileUpdateInput;
    Result: ProfileUpdateResult;
  };
}

export type ScenarioName = keyof ScenarioRegistry;
export type ScenarioHandler<I, R> = (scenarioInput: I, session: UserSession) => Promise<R>;
