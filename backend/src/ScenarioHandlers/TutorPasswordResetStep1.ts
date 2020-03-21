import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {makeTutorPasswordResetRequestFromInput} from "shared/src/Model/TutorPasswordResetStep1";
import {checkIfEmailExists, createTutorPasswordResetToken} from "backend/src/Persistence/TutorPersistence";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";

type Scenario = ScenarioRegistry["TutorPasswordResetStep1"];

export async function TutorPasswordResetStep1(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const result = makeTutorPasswordResetRequestFromInput(input);

  if (result.kind !== "TutorPasswordResetRequest") {
    return result;
  }

  const {email} = result;
  const emailCheckResult = await checkIfEmailExists(email);

  if (emailCheckResult.kind !== "EmailExists") {
    return emailCheckResult;
  }

  const {userId, fullName} = emailCheckResult;
  const resetTokenCreationResult = await createTutorPasswordResetToken(userId);

  if (resetTokenCreationResult.kind !== "PasswordResetToken") {
    return resetTokenCreationResult;
  }

  const {token} = resetTokenCreationResult;

  sendTutorPasswordResetEmail(email, fullName, token);

  return {
    kind: "TutorPasswordResetEmailSent",
  };
}

function sendTutorPasswordResetEmail(email: string, fullName: string, token: string): void {
  const subject = `Resetarea parolei în ${requireEnvVar("APP_NAME")}`;
  const html = getMessage(fullName, token);

  sendEmail(email, subject, html);
}

function getMessage(fullName: string, token: string): string {
  // TODO: Move PageNavigation to shared and use it here.
  const passwordResetLink = `/resetare-parola?token=${token}`;

  return `
    Dragă ${fullName},

    Accesați acest link pentru resetarea parolei în ${requireEnvVar("APP_NAME")}:
    ${passwordResetLink}
  `;
}
