import {createTransport} from "nodemailer";
import {requireEnvVar, requireNumericEnvVar, isTestEnvironment, isDevelopmentEnvironment} from "backend/src/Utils/Env";
import {logError} from "backend/src/Utils/Logging";
import {parseMarkdown} from "backend/src/Utils/Markdown";

// Exported for tests only.
export const transporter = createTransport({
  pool: true,
  host: requireEnvVar("APP_SMTP_HOST"),
  port: requireNumericEnvVar("APP_SMTP_PORT"),
  secure: true,
  auth: {
    user: requireEnvVar("APP_SMTP_USER"),
    pass: requireEnvVar("APP_SMTP_PASSWORD"),
  },
  logger: !isTestEnvironment(),
  debug: isDevelopmentEnvironment(),
});

const emailConfirmationMessageSenderAddress = requireEnvVar("APP_EMAIL_CONFIRMATION_MESSAGE_SENDER_ADDRESS");

export async function sendEmail(email: string, subject: string, markdown: string): Promise<void> {
  const html = parseMarkdown(`
<div style="max-width: 35em">
${markdown}
</div>
  `);

  const mail = {
    from: emailConfirmationMessageSenderAddress,
    to: email,
    subject,
    html,
  };

  return transporter.sendMail(mail).catch(e => logError(`nodemailer#sendMail failed`, e));
}
