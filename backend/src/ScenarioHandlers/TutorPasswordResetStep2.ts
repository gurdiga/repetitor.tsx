import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {makeTutorPasswordResetStep2RequestFromInput} from "shared/src/Model/TutorPasswordResetStep2";
import {verifyToken, deleteToken, resetPassword} from "backend/src/Persistence/TutorPersistence";
import {getStorablePassword} from "backend/src/Utils/StringUtils";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";

type Scenario = ScenarioRegistry["TutorPasswordResetStep2"];

export async function TutorPasswordResetStep2(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const inputValidationResult = makeTutorPasswordResetStep2RequestFromInput(input);

  if (inputValidationResult.kind !== "TutorPasswordResetStep2Request") {
    return inputValidationResult;
  }

  const {token, newPassword} = inputValidationResult;
  const storablePassword = getStorablePassword(newPassword);
  const tokenVerificationResult = await verifyToken(token);

  if (tokenVerificationResult.kind !== "PasswordResetTokenVerified") {
    return tokenVerificationResult;
  }

  const {userId, email, fullName} = tokenVerificationResult;

  await deleteToken(token);
  sendPasswordResetNotificationEmail(email, fullName);

  return await resetPassword(userId, storablePassword);
}

function sendPasswordResetNotificationEmail(email: string, fullName: string): void {
  sendEmail(
    email,
    `Parola dumneavoastră a fost resetată`,
    `Dragă ${fullName},

    Parola dumneavoastră a fost resetată. Puteți intra în aplicație aici: ${requireEnvVar("APP_URL")}.
    `
  );
}
