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
  const subject = `Bine ați venit la ${requireEnvVar("APP_NAME")}`;
  const html = getMessage(fullName);

  sendEmail(email, subject, html);
}

function getMessage(name: string): string {
  // TODO: Make this good after the confirmation link is up.
  const emailConfirmationLink = "/confirmare-repetitor"; // TODO: get the real link

  return `
    Welcome ${name}!

    Please click this link to confirm your email address.

    ${emailConfirmationLink}
  `;
}
