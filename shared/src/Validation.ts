export type ValidationRules = Record<string, PredicateFn>;
export type PredicateFn = (value: UserValue) => boolean;
export type UserValue = string | undefined;

export interface ValidatedValue<V extends UserValue = UserValue> {
  value: V;
  isValid: boolean;
}

// TODO: Maybe reimplement as a “tagged union”? https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
interface ValidationResult<C> {
  validationErrorCode: C;
  isValid: boolean;
}

export function validateWithRules<VR extends ValidationRules>(
  value: UserValue,
  validationRules: VR
): ValidationResult<keyof VR> {
  let failedValidationRule = Object.entries(validationRules).find(([_errorCode, predicate]) => !predicate(value));

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
