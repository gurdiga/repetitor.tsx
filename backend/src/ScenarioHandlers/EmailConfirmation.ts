import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession, initializeUserSession} from "shared/src/Model/UserSession";
import {makeEmailConfirmationRequestFromInput} from "shared/src/Model/EmailConfirmation";
import {verifyEmailConfirmationToken} from "backend/src/Persistence/EmailConfirmation";

type Scenario = ScenarioRegistry["EmailConfirmation"];

export async function EmailConfirmation(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeEmailConfirmationRequestFromInput(input);

  if (result.kind !== "EmailConfirmationRequest") {
    return result;
  }

  const emailConfirmationTokenVerificationResult = await verifyEmailConfirmationToken(result.token);

  if (emailConfirmationTokenVerificationResult.kind !== "EmailConfirmed") {
    return emailConfirmationTokenVerificationResult;
  }

  const {userId, email} = emailConfirmationTokenVerificationResult;

  initializeUserSession(session, {
    userId,
    email,
  });

  return emailConfirmationTokenVerificationResult;
}
