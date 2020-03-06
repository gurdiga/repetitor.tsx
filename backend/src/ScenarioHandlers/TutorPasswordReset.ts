import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {makeTutorPasswordResetFromInput} from "shared/Model/TutorPasswordReset";
import {checkIfEmailExists, createTutorPasswordResetToken} from "Persistence/TutorPersistence";
import {sendEmail} from "Utils/EmailUtils";
import {requireEnvVar} from "Utils/Env";

type Scenario = ScenarioRegistry["TutorPasswordReset"];

export async function TutorPasswordReset(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const result = makeTutorPasswordResetFromInput(input);

  if (result.kind !== "TutorPasswordReset") {
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

  sendTutorPasswordResetEmail(email, fullName, userId, token);

  return {
    kind: "TutorPasswordResetEmailSent",
  };
}

function sendTutorPasswordResetEmail(email: string, fullName: string, userId: number, token: string): void {
  const subject = `Recuperarea parolei în ${requireEnvVar("APP_NAME")}`;
  const html = getMessage(fullName, userId, token);

  sendEmail(email, subject, html);
}

function getMessage(fullName: string, userId: number, token: string): string {
  // TODO: Move PageNavigation to shared and use it here.
  const passwordResetLink = `/recuperare-parola?token=${token}&userId=${userId}`;

  return `
    Dragă ${fullName},

    Accesați acest link pentru resetarea parolei în ${requireEnvVar("APP_NAME")}:
    ${passwordResetLink}
  `;
}
