import {ActionName, ActionDirectory} from "./ActionDirectory";

type PredicateFn = (value: string) => boolean;
type ValidationRules = {[message: string]: PredicateFn};

export const ValidationRules: Record<ActionName, Record<string, ValidationRules>> = {
  RegisterUser: {
    fullName: {
      "Numele lipsește.": (text: string) => text.trim().length === 0,
      "Numele pare să fie prea scurt.": (text: string) => text.trim().length < 5,
      "Numele pare să fie prea lung.": (text: string) => text.trim().length > 50,
    },
    email: {
      "Adresa de email lipsește.": (text: string) => text.trim().length == 0,
      "Adresa de pare să fie incorectă.": (text: string) => !text.includes("@"),
    },
    password: {
      "Parola lipsește.": (text: string) => text.trim().length == 0,
    },
  } as Record<keyof ActionDirectory["RegisterUser"]["Params"], ValidationRules>,
  TestAction: {
    none: {},
  } as Record<keyof ActionDirectory["TestAction"]["Params"], ValidationRules>,
};

export interface ValidatedValue {
  text: string;
  isValid: boolean;
}

interface ValidationResult {
  validationMessage: string;
  isValid: boolean;
}

export function validateWithRules(text: string, validationRules: ValidationRules): ValidationResult {
  let validationMessage = "";

  let isValid = Object.entries(validationRules).every(([message, predicate]) => {
    if (predicate(text)) {
      validationMessage = message;
      return false;
    } else {
      validationMessage = "";
      return true;
    }
  });

  return {validationMessage, isValid};
}
