import {ActionName, ActionRegistry, FullNameErrorResponse} from "shared/ActionRegistry";

type PredicateFn = (value: string) => boolean;
type ValidationRules = {[message: string]: PredicateFn};

export const ValidationRules: Record<ActionName, Record<string, ValidationRules>> = {
  RegisterUser: {
    fullName: {
      "Numele lipsește.": (text: string) => text.trim().length > 0,
      "Numele pare să fie prea scurt.": (text: string) => text.trim().length >= 5,
      "Numele pare să fie prea lung.": (text: string) => text.trim().length <= 50,
    }, //as Record<FullNameErrorResponse["error"], PredicateFn>
    email: {
      "Adresa de email lipsește.": (text: string) => text.trim().length > 0,
      "Adresa de pare să fie incorectă.": (text: string) => text.includes("@"),
    },
    password: {
      "Parola lipsește.": (text: string) => text.trim().length > 0,
    },
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
  validationMessage: string;
  isValid: boolean;
}

export function validateWithRules(text: string, validationRules: ValidationRules): ValidationResult {
  // TODO: rename `~message` to `errorCode`
  let failedValidation = Object.entries(validationRules).find(([_message, predicate]) => !predicate(text));
  let isValid = !failedValidation;
  let validationMessage = failedValidation ? failedValidation[0] : "";

  return {isValid, validationMessage};
}
