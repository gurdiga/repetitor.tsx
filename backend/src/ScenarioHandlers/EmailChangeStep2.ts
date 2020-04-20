import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {changeEmail, verifyEmailChangeToken} from "backend/src/Persistence/EmailChange";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import {makeEmailChangeConfirmation} from "shared/src/Model/EmailChange";
import {ProfileLoaded} from "shared/src/Model/Profile";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";

type Scenario = ScenarioRegistry["EmailChangeStep2"];

export async function EmailChangeStep2(input: Scenario["Input"], _session: UserSession): Promise<Scenario["Result"]> {
  const inputValidationResult = makeEmailChangeConfirmation(input);

  if (inputValidationResult.kind !== "EmailChangeConfirmation") {
    return inputValidationResult;
  }

  const {token} = inputValidationResult;
  const tokenVerificationResult = await verifyEmailChangeToken(token);

  if (tokenVerificationResult.kind !== "EmailChangeTokenVerified") {
    return tokenVerificationResult;
  }

  const {userId, newEmail, currentEmail} = tokenVerificationResult;
  const changeEmailResult = await changeEmail(userId, newEmail, currentEmail);
  const profile = (await loadProfile(userId)) as ProfileLoaded; // ASSUMPTION: If changeEmail above succedes, so does loadProfile

  const {fullName} = profile;

  sendEmailChangeConfirmationMessage(newEmail, fullName);

  return changeEmailResult;
}

function sendEmailChangeConfirmationMessage(email: string, fullName: string) {
  sendEmail(
    email,
    "Email schimbat cu succes",
    `
Dragă ${fullName},

Vă aducem la cunoștință că email-ul dumneavoastră în sistemul
[${requireEnvVar("APP_NAME")}][1] a fost schimbat cu succes.
De acum încolo veți primi comunicările de sistem pe această adresă.

[1]: ${requireEnvVar("APP_URL")}
`
  );
}
