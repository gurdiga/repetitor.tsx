import {validateWithRules, ValidatedValue, ValidationRules} from "shared/Validation";

export namespace FormValidation {
  export type ValueChangeHandler = (value: ValidatedValue<string>) => void;

  export function buildInputEventHandler<T extends HTMLInputElement, VR extends ValidationRules>(
    validationRules: VR,
    setValidationErrorCode: (message: keyof VR) => void,
    onValueChange: ValueChangeHandler
  ): (event: React.ChangeEvent<T>) => void {
    return event => {
      const {value} = event.target;
      const {validationErrorCode, isValid} = validateWithRules(value, validationRules);

      setValidationErrorCode(validationErrorCode);
      onValueChange({value, isValid});
    };
  }
}
