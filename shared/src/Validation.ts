export type ValidationRules = Record<string, PredicateFn>;
export type PredicateFn = (value: UserValue) => boolean;
export type UserValue = string | undefined;

export interface ValidatedValue<V extends UserValue = UserValue> {
  value: V;
  isValid: boolean;
}

// TODO: Maybe reimplement as a “tagged union”? https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
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
  let failedValidationRule = Object.entries(validationRules).find(([_errorCode, predicate]) => !predicate(value));

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
