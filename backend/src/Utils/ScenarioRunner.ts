import {TestScenario} from "backend/src/ScenarioHandlers/TestScenario";
import {TutorLogin} from "backend/src/ScenarioHandlers/TutorLogin";
import {Logout} from "backend/src/ScenarioHandlers/Logout";
import {Registration} from "backend/src/ScenarioHandlers/Registration";
import {ScenarioHandler, ScenarioName} from "shared/src/ScenarioRegistry";
import {PasswordResetStep1} from "backend/src/ScenarioHandlers/PasswordResetStep1";
import {PasswordResetStep2} from "backend/src/ScenarioHandlers/PasswordResetStep2";
import {EmailConfirmation} from "backend/src/ScenarioHandlers/EmailConfirmation";
import {ProfileLoad} from "backend/src/ScenarioHandlers/ProfileLoad";
import {ProfileUpdate} from "backend/src/ScenarioHandlers/ProfileUpdate";

const scenarioHandlers: Record<ScenarioName, ScenarioHandler<any, any>> = {
  TestScenario,
  Registration,
  EmailConfirmation,
  TutorLogin,
  Logout,
  PasswordResetStep1,
  PasswordResetStep2,
  ProfileLoad,
  ProfileUpdate,
};

export async function runScenario(scenarioName?: string, scenarioInput: any = {}, session?: any): Promise<any> {
  const scenarioHandler = scenarioHandlers[scenarioName as ScenarioName];

  if (scenarioHandler) {
    return await scenarioHandler(scenarioInput, session);
  } else {
    if (!scenarioName) {
      throw new Error(`The "scenarioName" param is required`);
    } else {
      throw new Error(`Could not find scenario handler: "${scenarioName}"`);
    }
  }
}
