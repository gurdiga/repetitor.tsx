export namespace FormValidation {
  export type PredicateFn = (value: string) => boolean;
  export type ValidationRules = {[message: string]: PredicateFn};
  export type ValueChangeHandler = (value: ValidatedValue) => void;

  export interface ValidatedValue {
    text: string;
    isValid: boolean;
  }

  export function buildInputEventHandler<T extends HTMLInputElement>(
    validationRules: ValidationRules,
    setValidationMessage: (message: string) => void,
    onValueChange: ValueChangeHandler
  ): (event: React.ChangeEvent<T>) => void {
    return event => {
      const text = event.target.value;
      const {validationMessage, isValid} = validateWithRules(text, validationRules);

      setValidationMessage(validationMessage);
      onValueChange({text, isValid});
    };
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
}
