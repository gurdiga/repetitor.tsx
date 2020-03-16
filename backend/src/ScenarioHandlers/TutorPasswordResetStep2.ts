import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {makeTutorPasswordResetStep2RequestFromInput} from "shared/Model/TutorPasswordResetStep2";
import {resetTutorPassword} from "Persistence/TutorPersistence";
import {getStorablePassword} from "Utils/StringUtils";

type Scenario = ScenarioRegistry["TutorPasswordResetStep2"];

export async function TutorPasswordResetStep2(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const inputValidationResult = makeTutorPasswordResetStep2RequestFromInput(input);

  if (inputValidationResult.kind !== "TutorPasswordResetStep2Request") {
    return inputValidationResult;
  }

  const {token, newPassword} = inputValidationResult;
  const storablePassword = getStorablePassword(newPassword);

  return await resetTutorPassword(token, storablePassword);
}
