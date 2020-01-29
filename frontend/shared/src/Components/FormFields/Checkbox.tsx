import {CheckboxCss} from "frontend/shared/Components/FormFields/Checkbox.css";
import * as React from "react";
import {classes} from "typestyle";
import {FormField} from "frontend/shared/Components/FormFields/FormField";
import {FormValidation} from "frontend/shared/FormValidation";
import {getValidationErrorCode} from "shared/Utils/Validation";
import {ValidationMessage} from "frontend/shared/Components/FormFields/ValidationMessage";

interface Props extends FormField.CommonProps {
  checked?: never; // Will use "value" instead
}

export function Checkbox(props: Props) {
  const {id, label, className, showValidationMessage} = props;
  const {validationRules, validationMessages, onValueChange, value} = props;

  const initialValidationErrorCode = getValidationErrorCode(value, validationRules);
  const [validationErrorCode, setValidationErrorCode] = React.useState(initialValidationErrorCode);
  const onInput = FormValidation.buildInputEventHandler(validationRules, setValidationErrorCode, onValueChange);

  return (
    <div className={classes(CheckboxCss.Container, className)}>
      <input id={id} type="checkbox" onInput={onInput} checked={value === "on"} />
      <label htmlFor={id}>{label}</label>
      {showValidationMessage && validationErrorCode && (
        <ValidationMessage text={validationMessages[validationErrorCode]} />
      )}
    </div>
  );
}
