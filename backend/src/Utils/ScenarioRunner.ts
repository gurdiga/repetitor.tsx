import {TestScenario} from "ScenarioHandlers/TestScenario";
import {TutorLogin} from "ScenarioHandlers/TutorLogin";
import {Logout} from "ScenarioHandlers/Logout";
import {TutorRegistration} from "ScenarioHandlers/TutorRegistration";
import {
  ScenarioHandler,
  ScenarioName,
  SessionAlteringScenarioHandler,
  SimpleScenarioHandler,
  SimpleScenarioName,
  SessionAlteringScenarioName,
} from "shared/ScenarioRegistry";

const simpleScenarioHandlers: Record<SimpleScenarioName, SimpleScenarioHandler<any, any>> = {
  TestScenario,
};

const sessionAlteringScenarioHandlers: Record<SessionAlteringScenarioName, SessionAlteringScenarioHandler<any, any>> = {
  TutorRegistration,
  TutorLogin,
  Logout,
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
