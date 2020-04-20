import {RegistrationInput, RegistrationResult} from "shared/src/Scenarios/Registration";
import {TestScenarioInput, TestScenarioResult} from "shared/src/Scenarios/TestScenario";
import {LoginInput, LoginResult} from "shared/src/Scenarios/Login";
import {UserSession} from "shared/src/Model/UserSession";
import {LogoutInput, LogoutResult} from "shared/src/Scenarios/Logout";
import {
  PasswordResetStep1Input,
  PasswordResetStep1Result,
} from "shared/src/Scenarios/PasswordResetStep1";
import {
  PasswordResetStep2Input,
  PasswordResetStep2Result,
} from "shared/src/Scenarios/PasswordResetStep2";
import {EmailConfirmationInput, EmailConfirmationResult} from "shared/src/Scenarios/EmailConfirmation";
import {ProfileLoadInput, ProfileLoadResult} from "shared/src/Scenarios/ProfileLoad";
import {ProfileUpdateInput, ProfileUpdateResult} from "shared/src/Scenarios/ProfileUpdate";
import {EmailChangeStep1Input, EmailChangeStep2Result} from "shared/src/Scenarios/EmailChangeStep1";

export interface ScenarioRegistry {
  Registration: {
    Input: RegistrationInput;
    Result: RegistrationResult;
  };
  Login: {
    Input: LoginInput;
    Result: LoginResult;
  };
  Logout: {
    Input: LogoutInput;
    Result: LogoutResult;
  };
  TestScenario: {
    Input: TestScenarioInput;
    Result: TestScenarioResult;
  };
  PasswordResetStep1: {
    Input: PasswordResetStep1Input;
    Result: PasswordResetStep1Result;
  };
  PasswordResetStep2: {
    Input: PasswordResetStep2Input;
    Result: PasswordResetStep2Result;
  };
  EmailConfirmation: {
    Input: EmailConfirmationInput;
    Result: EmailConfirmationResult;
  };
  EmailChangeStep1: {
    Input: EmailChangeStep1Input;
    Result: EmailChangeStep2Result;
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
