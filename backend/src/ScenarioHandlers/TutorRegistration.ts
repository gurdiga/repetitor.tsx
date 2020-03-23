import {getStorablePassword} from "backend/src/Utils/StringUtils";
import {createTutor} from "backend/src/Persistence/TutorPersistence";
import {makeTutorFromRegistrationFormInput} from "shared/src/Model/Tutor";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {UserSession} from "shared/src/Model/UserSession";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";

type Scenario = ScenarioRegistry["TutorRegistration"];

export async function TutorRegistration(input: Scenario["Input"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeTutorFromRegistrationFormInput(input);

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {passwordSalt: salt, passwordHash} = getStorablePassword(password);

  const createTutorResult = await createTutor(fullName, email, passwordHash, salt);

  if (createTutorResult.kind === "TutorCreationSuccess") {
    session.userId = createTutorResult.id;
    session.email = email;
  }

  sendWelcomeMessage(fullName, email);

  return createTutorResult;
}

function sendWelcomeMessage(fullName: string, email: string) {
  return sendEmail(
    email,
    `Bine ați venit la ${requireEnvVar("APP_NAME")}`,
    `
Dragă ${fullName},

Ați primit acest mesaj pentru că v-ați înregistrat în sistemul [${requireEnvVar("APP_NAME")}][1].
Dați click pe link-ul de mai jos pentru a vă confirma adresa de email:

${requireEnvVar("APP_URL")}/confirmare-email

După confirmarea adresei de email veți putea primi alte notificări de
serviciu de la sistemul [${requireEnvVar("APP_NAME")}][1].

[1]: ${requireEnvVar("APP_URL")}
`
  );
}
