import {validateWithRules, ValidatedValue, ValidationRules} from "shared/src/Utils/Validation";

export namespace FormValidation {
  export type ValueChangeHandler = (value: ValidatedValue<string>) => void;

  export function buildInputEventHandler<T extends HTMLInputElement, VR extends ValidationRules>(
    validationRules: VR,
    setValidationErrorCode: (message: keyof VR | null) => void,
    onValueChange: ValueChangeHandler
  ): (event: React.ChangeEvent<T>) => void {
    return event => {
      let {value, type, checked} = event.target;

      if (type === "checkbox") {
        value = checked ? "off" : "on";
      }

      const result = validateWithRules(value, validationRules);

      if (result.kind === "Invalid") {
        setValidationErrorCode(result.validationErrorCode);
        onValueChange({value, isValid: false});
      } else {
        setValidationErrorCode(null);
        onValueChange({value, isValid: true});
      }
    };
  }
}
