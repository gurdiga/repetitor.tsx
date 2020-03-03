import {ScenarioRegistry} from "shared/ScenarioRegistry";
import {makeTutorPasswordRecoveryFromInput} from "shared/Model/TutorPasswordRecovery";
import {checkIfEmailExists, createTutorPasswordRecoveryToken} from "Persistence/TutorPersistence";
import {sendEmail} from "Utils/EmailUtils";
import {requireEnvVar} from "Utils/Env";

type Scenario = ScenarioRegistry["TutorPasswordRecovery"];

export async function TutorPasswordRecovery(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const result = makeTutorPasswordRecoveryFromInput(input);

  if (result.kind !== "TutorPasswordRecovery") {
    return result;
  }

  const {email} = result;
  const emailCheckResult = await checkIfEmailExists(email);

  if (emailCheckResult.kind !== "EmailExists") {
    return emailCheckResult;
  }

  const {userId, fullName} = emailCheckResult;
  const recoveryTokenCreationResult = await createTutorPasswordRecoveryToken(userId);

  if (recoveryTokenCreationResult.kind !== "RecoveryToken") {
    return recoveryTokenCreationResult;
  }

  const {token} = recoveryTokenCreationResult;

  sendTutorPasswordRecoveryEmail(email, fullName, userId, token);

  return {
    kind: "TutorPasswordRecoveryEmailSent",
  };
}

function sendTutorPasswordRecoveryEmail(email: string, fullName: string, userId: number, token: string): void {
  const subject = `Recuperarea parolei în ${requireEnvVar("APP_NAME")}`;
  const html = getMessage(fullName, userId, token);

  sendEmail(email, subject, html);
}

function getMessage(fullName: string, userId: number, token: string): string {
  // TODO: Move PageNavigation to shared and use it here.
  const passwordRecoveryLink = `/recuperare-parola?token=${token}&userId=${userId}`;

  return `
    Dragă ${fullName},

    Accesați acest link pentru resetarea parolei în ${requireEnvVar("APP_NAME")}:
    ${passwordRecoveryLink}
  `;
}
