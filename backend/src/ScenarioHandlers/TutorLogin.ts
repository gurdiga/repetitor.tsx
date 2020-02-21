import {checkLoginInfo} from "Persistence/TutorPersistence";
import {makeLoginCkeckFromLoginInput} from "shared/Model/LoginCheck";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {hashString} from "Utils/StringUtils";
import {UserSession} from "shared/Model/UserSession";

type Scenario = ScenarioRegistry["TutorLogin"];

export async function TutorLogin(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeLoginCkeckFromLoginInput(input);

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
