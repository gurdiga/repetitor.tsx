import {checkLoginInfo} from "backend/src/Persistence/TutorPersistence";
import {makeLoginCkeckFromLoginInput} from "shared/src/Model/LoginCheck";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {hashString} from "backend/src/Utils/StringUtils";
import {UserSession} from "shared/src/Model/UserSession";

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
    session.email = email;

    return {
      kind: "LoginCheckSuccess",
    };
  } else {
    return loginCheckResult;
  }
}
