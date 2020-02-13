import {checkLoginInfo} from "Persistence/TutorPersistence";
import {makeLoginCkeckFromLoginDTO} from "shared/Model/LoginCheck";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {hashString} from "Utils/StringUtils";
import {UserSession} from "shared/Model/UserSession";

type Scenario = ScenarioRegistry["TutorLogin"];

export async function TutorLogin(dto: Scenario["DTO"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeLoginCkeckFromLoginDTO(dto);

  if (result.kind !== "LoginCheck") {
    return result;
  }

  const {email, password} = result;
  const loginCheckResult = await checkLoginInfo(email, password, hashString);

  if (loginCheckResult.kind === "LoginCheckInfo") {
    session.userId = loginCheckResult.userId;

    return {
      kind: "LoginCheckSuccess",
    };
  } else {
    return loginCheckResult;
  }
}
