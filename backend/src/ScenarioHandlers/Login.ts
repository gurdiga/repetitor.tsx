import {checkLoginInfo} from "backend/src/Persistence/AccountPersistence";
import {makeLoginCkeckFromLoginInput} from "shared/src/Model/LoginCheck";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {hashString} from "backend/src/StringUtils";
import {UserSession, initializeUserSession} from "shared/src/Model/UserSession";

type Scenario = ScenarioRegistry["Login"];

export async function Login(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeLoginCkeckFromLoginInput(input);

  if (result.kind !== "LoginCheck") {
    return result;
  }

  const {email, password} = result;
  const loginCheckResult = await checkLoginInfo(email, password, hashString);

  if (loginCheckResult.kind === "LoginCheckInfo") {
    const {userId} = loginCheckResult;

    initializeUserSession(session, {userId, email});

    return {kind: "LoginCheckSuccess"};
  } else {
    return loginCheckResult;
  }
}
