import {
  checkIfEmailExists,
  createPasswordResetToken,
  PASSWORD_RESET_EXPIRATION_HOURS,
} from "backend/src/Persistence/AccountPersistence";
import {sendEmail} from "backend/src/EmailUtils";
import {requireEnvVar} from "backend/src/Env";
import {makePasswordResetRequestFromInput} from "shared/src/Model/PasswordReset";
import {ScenarioRegistry} from "shared/src/ScenarioRegistry";
import {PagePath} from "shared/src/Utils/PagePath";

type Scenario = ScenarioRegistry["PasswordResetStep1"];

export async function PasswordResetStep1(input: Scenario["Input"]): Promise<Scenario["Result"]> {
  const result = makePasswordResetRequestFromInput(input);

  if (result.kind !== "PasswordResetStep1") {
    return result;
  }

  const {email} = result;
  const emailCheckResult = await checkIfEmailExists(email);

  if (emailCheckResult.kind !== "EmailExists") {
    return emailCheckResult;
  }

  const {userId, fullName} = emailCheckResult;
  const resetTokenCreationResult = await createPasswordResetToken(userId);

  if (resetTokenCreationResult.kind !== "PasswordResetToken") {
    return resetTokenCreationResult;
  }

  const {token} = resetTokenCreationResult;

  sendPasswordResetEmail(email, fullName, token);

  return {kind: "PasswordResetEmailSent"};
}

function sendPasswordResetEmail(email: string, fullName: string, token: string): void {
  const expirationTime =
    PASSWORD_RESET_EXPIRATION_HOURS === 1 ? "într-o oră" : `în ${PASSWORD_RESET_EXPIRATION_HOURS} ore`;

  sendEmail(
    email,
    `Resetarea parolei`,
    `
Dragă ${fullName},
Ați primit acest mesaj pentru că ați inițiat procesul de resetare a
parolei în sistemul ${requireEnvVar("APP_NAME")}. Dacă nu dumneavoastră
ați inițiat acest proces, atunci puteți ignore acest mesaj.

Dacă dumneavoastră ați inițiat procesul de resetare a parolei, accesați
link-ul de mai jos pentru a continua:

${requireEnvVar("APP_URL")}${PagePath.PasswordReset}?token=${token}

Acest link va expira ${expirationTime}, dar puteți oricînd începe
procesul de la început dacă nu reușiți.
  `
  );
}
