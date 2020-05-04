import {isDevelopmentEnvironment, isTestEnvironment, requireEnvVar, requireNumericEnvVar} from "backend/src/Env";
import {logError} from "backend/src/ErrorLogging";
import {parseMarkdown} from "backend/src/Markdown";
import {createTransport} from "nodemailer";

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

Cele bune.

Vlad
</div>
  `);

  const mail = {
    from: emailConfirmationMessageSenderAddress,
    to: email,
    subject: `${requireEnvVar("APP_NAME")}: ${subject}`,
    html,
  };

  return transporter.sendMail(mail).catch((e) => logError(`nodemailer#sendMail failed`, e));
}
