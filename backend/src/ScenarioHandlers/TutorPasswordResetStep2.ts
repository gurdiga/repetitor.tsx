import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {makeTutorPasswordResetStep2RequestFromInput} from "shared/src/Model/TutorPasswordResetStep2";
import {verifyToken, deleteToken, resetPassword} from "backend/src/Persistence/TutorPersistence";
import {getStorablePassword} from "backend/src/Utils/StringUtils";
import {sendEmail} from "backend/src/Utils/EmailUtils";
import {requireEnvVar} from "backend/src/Utils/Env";
import {UserSession} from "shared/src/Model/UserSession";
import {PagePath} from "shared/src/Utils/PagePath";

type Scenario = ScenarioRegistry["TutorPasswordResetStep2"];

export async function TutorPasswordResetStep2(
  input: Scenario["Input"],
  session: UserSession
): Promise<Scenario["Result"]> {
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

  const resetPasswordResult = await resetPassword(userId, storablePassword);

  if (resetPasswordResult.kind === "TutorPasswordResetSuccess") {
    session.userId = userId;
    session.email = email;
  }

  return resetPasswordResult;
}

function sendPasswordResetNotificationEmail(email: string, fullName: string): void {
  sendEmail(
    email,
    `Parola dumneavoastră a fost resetată`,
    `
Dragă ${fullName},

Vă aducem la cunoștință că parola contului dumneavoastră (${email}) în sistemul
[${requireEnvVar("APP_NAME")}][1] a fost resetată.

[1]: ${requireEnvVar("APP_URL")}

Dacă nu ați resetat-o dumneavoastră, vă sfătui să o resetați acum urmînd link-ul
de mai jos:

${requireEnvVar("APP_URL")}/${PagePath.TutorPasswordReset}
`
  );
}
