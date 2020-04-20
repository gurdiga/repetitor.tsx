import {ValidationMessages, PredicateFn, UserValue} from "shared/src/Utils/Validation";

export type EmailError = {
  kind: "EmailError";
  errorCode: EmailValidationErrorCode;
};

export type EmailValidationErrorCode = "REQUIRED" | "INCORRECT";

export const EmailErrorMessages: ValidationMessages<typeof EmailValidationRules> = {
  REQUIRED: "Adresa de email lipsește",
  INCORRECT: "Adresa de email este invalidă",
};

export const EmailValidationRules: Record<EmailValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  INCORRECT: isSyntacticallyCorrectEmail,
};

function isSyntacticallyCorrectEmail(text: UserValue): boolean {
  if (!text) {
    return false;
  }

  text = text.trim();

  const keyCharacters = [".", "@"];
  const containsKeyCharacters = keyCharacters.every((c) => !!text && text.includes(c));

  if (!containsKeyCharacters) {
    return false;
  }

  const sides = text.split("@");
  const [login, domain] = sides.map((s) => s.trim());

  const doesLoginLookReasonable = login.length >= 2 && /[a-z0-9]+/i.test(login);

  if (!doesLoginLookReasonable) {
    return false;
  }

  const domainLevels = domain.split(/\./).reverse();
  const doDomainPartsLookReasonable = /[a-z]{2,}/i.test(domainLevels[0]) && domainLevels.every((l) => l.length >= 1);

  if (!doDomainPartsLookReasonable) {
    return false;
  }

  return true;
}
