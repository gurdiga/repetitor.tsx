import {FormField} from "frontend/shared/src/Components/FormFields/FormField";
import {TextFieldCss} from "frontend/shared/src/Components/FormFields/TextField.css";
import {ValidationMessage} from "frontend/shared/src/Components/FormFields/ValidationMessage";
import {FormValidation} from "frontend/shared/src/FormValidation";
import * as React from "react";
import {getValidationErrorCode} from "shared/src/Utils/Validation";
import {Label} from "frontend/shared/src/Components/FormFields/Label";

interface Props extends FormField.CommonProps {
  inputType?: InputType;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType = "text" | "email";

export function TextField(props: Props) {
  const {
    validationRules,
    onValueChange,
    id,
    autoFocus,
    inputType,
    label,
    showValidationMessage,
    value,
    additionalControls,
  } = props;
  const {validationMessages} = props;

  const initialValidationErrorCode = getValidationErrorCode(value, validationRules);
  const [validationErrorCode, setValidationErrorCode] = React.useState(initialValidationErrorCode);
  const onInput = FormValidation.buildInputEventHandler(validationRules, setValidationErrorCode, onValueChange);

  return (
    <>
      <Label htmlFor={id}>{label}:</Label>
      <input
        type={inputType || "text"}
        id={id}
        autoFocus={!!autoFocus}
        value={value}
        onInput={onInput}
        className={TextFieldCss.Input}
      />
      {showValidationMessage && validationErrorCode && (
        <ValidationMessage text={validationMessages[validationErrorCode]} />
      )}
      {additionalControls &&
        (typeof additionalControls === "string" ? (
          <p className={TextFieldCss.Info}>{additionalControls}</p>
        ) : (
          additionalControls
        ))}
    </>
  );
}
