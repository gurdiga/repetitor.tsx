import {getStorablePassword} from "../Utils/StringUtils";
import {createTutor} from "../Persistence/TutorPersistence";
import {makeTutorFromRegistrationFormDTO} from "shared/Model/Tutor";
import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {UserSession} from "shared/Model/UserSession";
import {sendEmail} from "Utils/EmailUtils";
import {requireEnvVar} from "Utils/Env";

type Scenario = ScenarioRegistry["TutorRegistration"];

export async function TutorRegistration(dto: Scenario["DTO"], session: UserSession): Promise<Scenario["Result"]> {
  const result = makeTutorFromRegistrationFormDTO(dto);

  if (result.kind !== "User") {
    return result;
  }

  const {fullName, email, password} = result;
  const {salt, passwordHash} = getStorablePassword(password);

  const createTutorResult = await createTutor(fullName, email, passwordHash, salt);

  if (createTutorResult.kind === "TutorCreationSuccess") {
    session.userId = createTutorResult.id;
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
  const emailConfirmationLink = "/confirmare-repetitor"; // TODO: get the real link

  return `
    Welcome ${name}!

    Please click this link to confirm your email address.

    ${emailConfirmationLink}
  `;
}
