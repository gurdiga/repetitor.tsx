import {TestScenario} from "backend/src/ScenarioHandlers/TestScenario";
import {TutorLogin} from "backend/src/ScenarioHandlers/TutorLogin";
import {Logout} from "backend/src/ScenarioHandlers/Logout";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {
  ScenarioHandler,
  ScenarioName,
  SessionAlteringScenarioHandler,
  SimpleScenarioHandler,
  SimpleScenarioName,
  SessionAlteringScenarioName,
} from "shared/src/ScenarioRegistry";
import {TutorPasswordResetStep1} from "backend/src/ScenarioHandlers/TutorPasswordResetStep1";
import {TutorPasswordResetStep2} from "backend/src/ScenarioHandlers/TutorPasswordResetStep2";
import {EmailConfirmation} from "backend/src/ScenarioHandlers/EmailConfirmation";
import {ProfileLoad} from "backend/src/ScenarioHandlers/ProfileLoad";

const simpleScenarioHandlers: Record<SimpleScenarioName, SimpleScenarioHandler<any, any>> = {
  TestScenario,
  TutorPasswordResetStep1,
  ProfileLoad,
};

const sessionAlteringScenarioHandlers: Record<SessionAlteringScenarioName, SessionAlteringScenarioHandler<any, any>> = {
  TutorRegistration,
  TutorLogin,
  Logout,
  TutorPasswordResetStep2,
  EmailConfirmation,
};

const scenarioHandlers: Record<ScenarioName, ScenarioHandler<any, any>> = {
  ...simpleScenarioHandlers,
  ...sessionAlteringScenarioHandlers,
};

export async function runScenario(scenarioName_?: string, scenarioInput: any = {}, session?: any): Promise<any> {
  const scenarioName = scenarioName_ as ScenarioName;
  const scenarioHandler = scenarioHandlers[scenarioName];

  if (scenarioHandler) {
    if (scenarioName in sessionAlteringScenarioHandlers) {
      if (session) {
        const sessionAlteringScenario = scenarioHandler as SessionAlteringScenarioHandler<any, any>;

        return await sessionAlteringScenario(scenarioInput, session);
      } else {
        throw new Error(`Session is missing`);
      }
    } else {
      const simpleScenarioHandler = scenarioHandler as SimpleScenarioHandler<any, any>;

      return await simpleScenarioHandler(scenarioInput);
    }
  } else {
    if (!scenarioName) {
      throw new Error(`The "scenarioName" param is required`);
    } else {
      throw new Error(`Could not find scenario handler: "${scenarioName}"`);
    }
  }
}
