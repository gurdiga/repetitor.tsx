import {UserRegistration} from "../Scenarios/UserRegistration";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {TestScenario} from "src/Scenarios/TestScenario";

const scenarioList: Record<keyof ScenarioRegistry, (arg: any) => any> = {UserRegistration, TestScenario};

export async function runScenario(scenarioName?: string, dto: any = {}): Promise<any> {
  if (!scenarioName) {
    throw new Error(`The "scenarioName" param is required`);
  }

  const scenarioHandler = scenarioList[scenarioName as keyof typeof scenarioList];

  if (!scenarioHandler) {
    throw new Error(`Could not find scenario handler for: "${scenarioName}"`);
  }

  return await scenarioHandler(dto);
}
