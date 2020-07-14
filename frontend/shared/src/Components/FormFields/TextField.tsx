import {FormField} from "frontend/shared/src/Components/FormFields/FormField";
import {Label} from "frontend/shared/src/Components/FormFields/Label";
import {TextFieldCss} from "frontend/shared/src/Components/FormFields/TextField.css";
import {ValidationMessage} from "frontend/shared/src/Components/FormFields/ValidationMessage";
import {FormValidation} from "frontend/shared/src/FormValidation";
import * as React from "react";
import {getValidationErrorCode} from "shared/src/Utils/Validation";

interface Props extends FormField.CommonProps {
  inputType?: InputType;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType = "text" | "email";

export function TextField(props: Props) {
  const {id, label, value, autoFocus, inputType: type = "text", readOnly} = props;
  const {validationRules, validationMessages, showValidationMessage, additionalControls, onValueChange} = props;

  const initialValidationErrorCode = getValidationErrorCode(value, validationRules);
  const [validationErrorCode, setValidationErrorCode] = React.useState(initialValidationErrorCode);
  const onInput = FormValidation.buildInputEventHandler(validationRules, setValidationErrorCode, onValueChange);

  const validationMessage = validationErrorCode
    ? validationMessages[validationErrorCode] || `No validation message for code ${validationErrorCode}`
    : ""; // TODO: Make this state impossible: require the same keys in validationRules and validationMessages

  return (
    <>
      <Label htmlFor={id}>{label}:</Label>
      <input {...{type, id, onInput, value, autoFocus, readOnly}} className="form-input" />
      {showValidationMessage && <ValidationMessage text={validationMessage} />}
      {additionalControls &&
        (typeof additionalControls === "string" ? (
          <p className={TextFieldCss.Info}>{additionalControls}</p>
        ) : (
          additionalControls
        ))}
    </>
  );
}
