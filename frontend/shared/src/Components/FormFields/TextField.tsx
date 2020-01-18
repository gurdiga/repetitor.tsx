import {FormField} from "frontend/shared/Components/FormFields/FormField";
import {TextFieldCss} from "frontend/shared/Components/FormFields/TextField.css";
import {ValidationMessage} from "frontend/shared/Components/FormFields/ValidationMessage";
import {FormValidation} from "frontend/shared/FormValidation";
import * as React from "react";
import {validateWithRules} from "shared/Validation";

interface Props extends FormField.CommonProps {
  inputType?: InputType;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType = "text" | "email";

export function TextField(props: Props) {
  const {validationRules, onValueChange, id, autoFocus, inputType, label, showValidationMessage, value} = props;

  const initialValidationMessage = validateWithRules(value, validationRules).validationMessage;
  const [validationMessage, setValidationMessage] = React.useState(initialValidationMessage);
  const onInput = FormValidation.buildInputEventHandler(validationRules, setValidationMessage, onValueChange);

  return (
    <>
      <label htmlFor={id}>{label}:</label>
      <input
        type={inputType || "text"}
        id={id}
        autoFocus={!!autoFocus}
        value={value}
        onInput={onInput}
        className={TextFieldCss.Input}
      />
      {showValidationMessage && <ValidationMessage text={validationMessage} />}
    </>
  );
}
