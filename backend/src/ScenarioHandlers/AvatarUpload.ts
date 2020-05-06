import {UploadedFile} from "shared/src/Model/UploadedFile";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["AvatarUpload"];

export async function AvatarUpload(
  _input: Scenario["Input"],
  _session: UserSession,
  uploadedFiles: UploadedFile[]
): Promise<Scenario["Result"]> {
  console.log({uploadedFiles});

  return {
    kind: "UnexpectedError",
    error: "Not yet implemented",
  };
}
