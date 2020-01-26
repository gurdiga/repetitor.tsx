export type PredicateFn = (value: string) => boolean;
type ValidationRules = {[message: string]: PredicateFn};

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
