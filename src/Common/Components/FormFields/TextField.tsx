import * as React from "react";

import {FormValidation} from "Common/FormValidation";
import {FormField} from "Common/Components/FormFields/FormField";
import {ValidationMessage} from "Common/Components/FormFields/ValidationMessage";
import {TextFieldCss} from "Common/Components/FormFields/TextField.css";

interface Props extends FormField.CommonProps {
  inputType?: InputType;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType = "text" | "email";

export const TextField = (props: Props) => {
  const {validationRules, onValueChange, id, autoFocus, inputType, label, showValidationMessage, value} = props;

  const initialValidationMessage = FormValidation.validateWithRules(value, validationRules).validationMessage;
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
};
