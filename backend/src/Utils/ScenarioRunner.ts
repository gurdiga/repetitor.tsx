import {TestScenario} from "ScenarioHandlers/TestScenario";
import {TutorLogin} from "ScenarioHandlers/TutorLogin";
import {UserRegistration} from "ScenarioHandlers/UserRegistration";
import {ScenarioHandler, ScenarioName} from "shared/ScenarioRegistry";

const scenarioList: Record<ScenarioName, ScenarioHandler<any, any>> = {
  UserRegistration,
  TestScenario,
  TutorLogin,
};

export async function runScenario(scenarioName?: string, dto: any = {}): Promise<any> {
  const scenarioHandler = scenarioList[scenarioName as ScenarioName];

  if (scenarioHandler) {
    return await scenarioHandler(dto);
  } else {
    if (!scenarioName) {
      throw new Error(`The "scenarioName" param is required`);
    } else {
      throw new Error(`Could not find scenario handler for: "${scenarioName}"`);
    }
  }
}
