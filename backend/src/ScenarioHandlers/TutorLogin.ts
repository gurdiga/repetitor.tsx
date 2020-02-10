import debug from "debug";
import {getUserId} from "Persistence/UserPersistence";
import {makeLoginCkeckFromLoginDTO} from "shared/Model/LoginCheck";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {getStorablePassword} from "Utils/StringUtils";

const log = debug("app:UserRegistration");

type Scenario = ScenarioRegistry["TutorLogin"];

export async function TutorLogin(dto: Scenario["DTO"]): Promise<Scenario["Result"]> {
  const result = makeLoginCkeckFromLoginDTO(dto);

  log({dto, result});

  if (result.kind !== "LoginCheck") {
    return result;
  }

  const {email, password} = result;
  const {passwordHash} = getStorablePassword(password);

  return getUserId(email, passwordHash);
}
