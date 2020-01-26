import {ActionName, ActionRegistry} from "shared/ActionRegistry";
import {FullNameValidationErrorCode, EmailValidationErrorCode, PasswordValidationErrorCode} from "shared/Domain/User";

type PredicateFn = (value: string) => boolean;
type ValidationRules = {[message: string]: PredicateFn};

const fullNameVR: Record<FullNameValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: string) => text.trim().length > 0,
  TOO_SHORT: (text: string) => text.trim().length >= 5,
  TOO_LONG: (text: string) => text.trim().length <= 50,
};

const emailVR: Record<EmailValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: string) => text.trim().length > 0,
  INCORRECT: (text: string) => {
    // TODO: extract function syntacticallyCorrectEmail
    text = text.trim();

    const keyCharacters = [".", "@"];
    const containsKeyCharacters = keyCharacters.every(c => text.includes(c));

    if (!containsKeyCharacters) {
      return false;
    }

    const sides = text.split("@");
    const [login, domain] = sides.map(s => s.trim());

    const doesLoginLookReasonable = login.length >= 2 && /[a-z0-9]+/i.test(login);

    if (!doesLoginLookReasonable) {
      return false;
    }

    const domainLevels = domain.split(/\./).reverse();
    const doDomainPartsLookReasonable = /[a-z]{2,}/i.test(domainLevels[0]) && domainLevels.every(l => l.length >= 1);

    if (!doDomainPartsLookReasonable) {
      return false;
    }

    return true;
  },
};

const passwordVR: Record<PasswordValidationErrorCode, PredicateFn> = {
  REQUIRED: (text: string) => text.trim().length > 0,
};

export const ValidationRules: Record<ActionName, Record<string, ValidationRules>> = {
  RegisterUser: {
    fullName: fullNameVR,
    email: emailVR,
    password: passwordVR,
  } as Record<keyof ActionRegistry["RegisterUser"]["Params"], ValidationRules>,
  TestAction: {
    none: {},
  } as Record<keyof ActionRegistry["TestAction"]["Params"], ValidationRules>,
};

export interface ValidatedValue {
  text: string;
  isValid: boolean;
}

interface ValidationResult {
  validationErrorCode: string;
  isValid: boolean;
}

export function validateWithRules(text: string, validationRules: ValidationRules): ValidationResult {
  let failedValidationRule = Object.entries(validationRules).find(([_errorCode, predicate]) => !predicate(text));

  if (failedValidationRule) {
    return {
      isValid: false,
      validationErrorCode: failedValidationRule[0],
    };
  } else {
    return {
      isValid: true,
      validationErrorCode: "",
    };
  }
}
