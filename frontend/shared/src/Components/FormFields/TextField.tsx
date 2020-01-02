import * as React from "react";
import {FormField} from "./FormField";
import {FormValidation} from "../../FormValidation";
import {TextFieldCss} from "./TextField.css";
import {ValidationMessage} from "./ValidationMessage";

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
