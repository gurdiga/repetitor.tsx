export namespace FormValidation {
  export type PredicateFn = (value: string) => boolean;
  export type ValidationRules = {[message: string]: PredicateFn};
  export type ValueChangeHandler = ([newValue, isValid]: [string, boolean]) => void;

  export function buildInputEventHandler<T extends HTMLInputElement>(
    validationRules: ValidationRules,
    setValidationMessage: (message: string) => void,
    onValueChange: ValueChangeHandler
  ): (event: React.ChangeEvent<T>) => void {
    return event => {
      const {value} = event.target;
      const [validationMessage, isValid] = validateWithRules(value, validationRules);

      if (isValid) {
        setValidationMessage("");
      } else {
        setValidationMessage(validationMessage);
      }

      onValueChange([value, isValid]);
    };
  }

  export function validateWithRules(value: string, validationRules: ValidationRules): [string, boolean] {
    let validationMessage = "";
    let isValid = Object.entries(validationRules).every(([message, predicate]) => {
      if (predicate(value)) {
        validationMessage = message;
        return false;
      } else {
        validationMessage = "";
        return true;
      }
    });

    return [validationMessage, isValid];
  }
}
