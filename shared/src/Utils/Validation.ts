export type ValidationRules<ErrorCodes extends string = string> = Record<ErrorCodes, PredicateFn>;
export type ValidationMessages<VR extends ValidationRules> = Record<keyof VR, string>;
export type ErrorMessages<T extends string> = Record<T, string>;
export type PredicateFn = (value: UserValue) => boolean;
export type UserValue = string | undefined;

export interface ValidatedValue<V extends UserValue = UserValue> {
  value: V;
  isValid: boolean;
}

export const initialFieldValue: ValidatedValue<string> = {
  value: "",
  isValid: false,
};

type ValidationResult<C, V> =
  | {
      kind: "Valid";
      value: V;
    }
  | {
      kind: "Invalid";
      validationErrorCode: C;
    };

export function validateWithRules<V extends string, VR extends ValidationRules>(
  value: V | undefined,
  validationRules: VR
): ValidationResult<keyof VR, V> {
  const failedValidationRule = Object.entries(validationRules).find(([_errorCode, predicate]) => !predicate(value));

  if (failedValidationRule) {
    return {
      kind: "Invalid",
      validationErrorCode: failedValidationRule[0],
    };
  } else {
    return {
      kind: "Valid",
      value: value as V,
    };
  }
}

export function getValidationErrorCode<VR extends ValidationRules>(
  value: UserValue,
  validationRules: VR
): keyof VR | null {
  const result = validateWithRules(value, validationRules);

  if (result.kind === "Invalid") {
    return result.validationErrorCode;
  } else {
    return null;
  }
}
