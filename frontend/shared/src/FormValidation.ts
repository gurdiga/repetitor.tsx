import {validateWithRules, ValidatedValue} from "shared/Validation";

export namespace FormValidation {
  export type PredicateFn = (value: string) => boolean;
  export type ValidationRules = {[message: string]: PredicateFn};
  export type ValueChangeHandler = (value: ValidatedValue) => void;

  export function buildInputEventHandler<T extends HTMLInputElement>(
    validationRules: ValidationRules,
    setErrorCode: (message: string) => void,
    onValueChange: ValueChangeHandler
  ): (event: React.ChangeEvent<T>) => void {
    return event => {
      const text = event.target.value;
      const {validationErrorCode: errorCode, isValid} = validateWithRules(text, validationRules);

      setErrorCode(errorCode);
      onValueChange({text, isValid});
    };
  }
}
