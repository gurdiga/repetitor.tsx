import {TestScenario} from "ScenarioHandlers/TestScenario";
import {TutorLogin} from "ScenarioHandlers/TutorLogin";
import {Logout} from "ScenarioHandlers/Logout";
import {UserRegistration} from "ScenarioHandlers/UserRegistration";
import {
  ScenarioHandler,
  ScenarioName,
  SessionAlteringScenarioHandler,
  SimpleScenarioHandler,
} from "shared/ScenarioRegistry";

const scenarioList: Record<ScenarioName, ScenarioHandler<any, any>> = {
  UserRegistration,
  TestScenario,
  TutorLogin,
  Logout,
};

const sessionAlteringScenarios: ScenarioName[] = ["TutorLogin", "Logout"]; // TODO: Add UserRegistration?

export async function runScenario(scenarioName_?: string, dto: any = {}, session?: any): Promise<any> {
  const scenarioName = scenarioName_ as ScenarioName;
  const scenarioHandler = scenarioList[scenarioName];

  if (scenarioHandler) {
    if (sessionAlteringScenarios.includes(scenarioName)) {
      if (session) {
        const sessionAlteringScenario = scenarioHandler as SessionAlteringScenarioHandler<any, any>;

        return await sessionAlteringScenario(dto, session);
      } else {
        throw new Error(`Session is missing.`);
      }
    } else {
      const simpleScenarioHandler = scenarioHandler as SimpleScenarioHandler<any, any>;

      return await simpleScenarioHandler(dto);
    }
  } else {
    if (!scenarioName) {
      throw new Error(`The "scenarioName" param is required`);
    } else {
      throw new Error(`Could not find scenario handler: "${scenarioName}"`);
    }
  }
}
