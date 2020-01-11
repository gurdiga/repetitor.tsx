import {validateWithRules, ValidatedValue} from "shared/Validation";

export namespace FormValidation {
  export type PredicateFn = (value: string) => boolean;
  export type ValidationRules = {[message: string]: PredicateFn};
  export type ValueChangeHandler = (value: ValidatedValue) => void;

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
}
