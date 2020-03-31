import {TestScenario} from "backend/src/ScenarioHandlers/TestScenario";
import {TutorLogin} from "backend/src/ScenarioHandlers/TutorLogin";
import {Logout} from "backend/src/ScenarioHandlers/Logout";
import {TutorRegistration} from "backend/src/ScenarioHandlers/TutorRegistration";
import {ScenarioHandler, ScenarioName} from "shared/src/ScenarioRegistry";
import {TutorPasswordResetStep1} from "backend/src/ScenarioHandlers/TutorPasswordResetStep1";
import {TutorPasswordResetStep2} from "backend/src/ScenarioHandlers/TutorPasswordResetStep2";
import {EmailConfirmation} from "backend/src/ScenarioHandlers/EmailConfirmation";
import {ProfileLoad} from "backend/src/ScenarioHandlers/ProfileLoad";

const scenarioHandlers: Record<ScenarioName, ScenarioHandler<any, any>> = {
  TestScenario,
  TutorPasswordResetStep1,
  ProfileLoad,
  TutorRegistration,
  TutorLogin,
  Logout,
  TutorPasswordResetStep2,
  EmailConfirmation,
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
