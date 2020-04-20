import {loadProfile} from "backend/src/Persistence/AccountPersistence";
import {EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS, registerEmailChangeRequest} from "backend/src/Persistence/EmailChange";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import {makeEmailChangeRequest} from "shared/src/Model/EmailChange";
import {UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {PagePath} from "shared/src/Utils/PagePath";

type Scenario = ScenarioRegistry["EmailChangeStep1"];

export async function EmailChangeStep1(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const {email: currentEmail, userId} = session;

  if (!currentEmail || !userId) {
    return {kind: "NotAuthenticatedError"};
  }

  const inputValidationResult = makeEmailChangeRequest(input, currentEmail);

  if (inputValidationResult.kind !== "EmailChangeRequest") {
    return inputValidationResult;
  }

  const registrationResult = await registerEmailChangeRequest(userId, inputValidationResult);

  if (registrationResult.kind !== "RequestCreated") {
    return registrationResult;
  }

  const loadProfileResult = await loadProfile(userId);

  if (loadProfileResult.kind !== "ProfileLoaded") {
    return loadProfileResult;
  }

  const {newEmail} = inputValidationResult;
  const {fullName} = loadProfileResult;
  const {token} = registrationResult;

  sendEmailChangeConfirmationRequestMessage(newEmail, fullName, token);

  return {kind: "EmailChangeConfirmationRequestSent"};
}

function sendEmailChangeConfirmationRequestMessage(newEmail: string, fullName: string, token: string): void {
  const expirationTime =
    EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS === 1 ? "într-o oră" : `în ${EMAIL_CHANGE_REQUEST_EXPIRATION_HOURS} ore`;

  sendEmail(
    newEmail,
    "Schimbare email",
    `
Dragă ${fullName},

Ați primit acest mesaj pentru că ați inițiat procesul de schimbare a
adresei de email în sistemul ${requireEnvVar("APP_NAME")}. Dacă nu dumneavoastră
ați inițiat acest proces, atunci puteți ignore acest mesaj.

Dacă dumneavoastră ați inițiat procesul de schimbare a adresei de email, accesați
link-ul de mai jos pentru a continua:

${requireEnvVar("APP_URL")}${PagePath.EmailChange}?token=${token}

Acest link va expira ${expirationTime}, dar puteți oricînd începe procesul de la
început dacă nu reușiți.
  `
  );
}
