import {sendEmail} from "backend/src/EmailUtils";
import {requireEnvVar} from "backend/src/Env";
import {createUser} from "backend/src/Persistence/AccountPersistence";
import {getRandomString, getStorablePassword} from "backend/src/StringUtils";
import {makeRegistrationRequestFromInput} from "shared/src/Model/Account";
import {initializeUserSession, UserSession} from "shared/src/Model/UserSession";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {PagePath} from "shared/src/Utils/PagePath";

type Scenario = ScenarioRegistry["Registration"];

const EMAIL_CONFIRMATION_TOKEN_LENGTH = 16;

export async function Registration(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeRegistrationRequestFromInput(input);

  if (result.kind !== "RegistrationRequest") {
    return result;
  }

  const {fullName, email, password} = result;
  const {passwordSalt: salt, passwordHash} = getStorablePassword(password);
  const emailConfirmationToken = getRandomString(EMAIL_CONFIRMATION_TOKEN_LENGTH);
  const createUserResult = await createUser(fullName, email, passwordHash, salt, emailConfirmationToken);

  if (createUserResult.kind === "AccountCreationSuccess") {
    initializeUserSession(session, {userId: createUserResult.id, email});
  }

  sendWelcomeMessage(fullName, email, emailConfirmationToken);

  return createUserResult;
}

function sendWelcomeMessage(fullName: string, email: string, emailConfirmationToken: string) {
  sendEmail(
    email,
    `Bine ați venit!`,
    `
Dragă ${fullName},

Ați primit acest mesaj pentru că v-ați înregistrat în sistemul [${requireEnvVar("APP_NAME")}][1].
Dați click pe link-ul de mai jos pentru a vă confirma adresa de email:

${requireEnvVar("APP_URL")}${PagePath.EmailConfirmation}?token=${emailConfirmationToken}

După confirmarea adresei de email, vă veți putea autentifica în sistem, și veți putea primi
notificări de serviciu.

[1]: ${requireEnvVar("APP_URL")}
`
  );
}
