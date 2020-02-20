import {createTransport} from "nodemailer";
import {requireEnvVar, requireNumericEnvVar} from "Utils/Env";
import {logError} from "Utils/Logging";

const transporter = createTransport({
  pool: true,
  host: requireEnvVar("APP_SMTP_HOST"),
  port: requireNumericEnvVar("APP_SMTP_PORT"),
  secure: true,
  auth: {
    user: requireEnvVar("APP_SMTP_USER"),
    pass: requireEnvVar("APP_SMTP_PASSWORD"),
  },
});

const emailConfirmationMessageSenderAddress = requireEnvVar("APP_EMAIL_CONFIRMATION_MESSAGE_SENDER_ADDRESS");

export async function sendEmail(email: string, subject: string, html: string): Promise<void> {
  const mail = {
    from: emailConfirmationMessageSenderAddress,
    to: email,
    subject,
    html,
  };

  return transporter.sendMail(mail).catch(e => logError(`nodemailer#sendMail failed`, e));
}
