import {FormField} from "frontend/shared/src/Components/FormFields/FormField";
import {PasswordFieldCss} from "frontend/shared/src/Components/FormFields/PasswordField.css";
import {ValidationMessage} from "frontend/shared/src/Components/FormFields/ValidationMessage";
import {FormValidation} from "frontend/shared/src/FormValidation";
import {PasswordGenerator} from "frontend/shared/src/PasswordGenerator";
import * as React from "react";
import {getValidationErrorCode} from "shared/src/Utils/Validation";
import {TextFieldCss} from "frontend/shared/src/Components/FormFields/TextField.css";
import {Label} from "frontend/shared/src/Components/FormFields/Label";

interface Props extends FormField.CommonProps {
  hasGenerateButton?: boolean;
}

export function PasswordField(props: Props) {
  const {id, label, value: initialValue, onValueChange, showValidationMessage, validationRules, autoFocus} = props;
  const {validationMessages, hasGenerateButton, info} = props;

  const [value, setValue] = React.useState(initialValue);
  const [isMasked, setIsMasked] = React.useState(true);

  const initialValidationErrorCode = getValidationErrorCode(value, validationRules);
  const [validationErrorCode, setValidationErrorCode] = React.useState(initialValidationErrorCode);

  const onInput = FormValidation.buildInputEventHandler(validationRules, setValidationErrorCode, ({value, isValid}) => {
    setValue(value);
    onValueChange({value, isValid});
  });

  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <>
      <Label htmlFor={id}>{label}:</Label>

      <span className={PasswordFieldCss.InputContainer}>
        <input
          type={isMasked ? "password" : "text"}
          id={id}
          autoFocus={!!autoFocus}
          value={value}
          onInput={onInput}
          className={PasswordFieldCss.Input}
          ref={inputRef}
        />

        {hasGenerateButton && (
          <button
            type="button"
            className={PasswordFieldCss.GenerateButton}
            onClick={onGenerateButtonClick}
            title={PasswordGenerator.description}
          >
            👍 Generează una bună
          </button>
        )}

        <button
          type="button"
          className={PasswordFieldCss.EyeButton}
          aria-label={isMasked ? "Demască parola" : "Maschează parola"}
          title={isMasked ? "Demască parola" : "Maschează parola"}
          onClick={() => setIsMasked(!isMasked)}
        >
          {isMasked ? eyeOpenedIcon : eyeClosedIcon}
        </button>
      </span>

      {showValidationMessage && validationErrorCode && (
        <ValidationMessage text={validationMessages[validationErrorCode]} />
      )}
      {info && (typeof info === "string" ? <p className={TextFieldCss.Info}>{info}</p> : info)}
    </>
  );

  function onGenerateButtonClick() {
    inputRef.current && inputRef.current.focus();

    const generatedPassword = PasswordGenerator.newPassword();

    setValue(generatedPassword);
    onValueChange({value: generatedPassword, isValid: true});
    setIsMasked(false);
    setValidationErrorCode("");
  }
}

// https://thenounproject.com/term/eye/140036/
const eyeOpenedIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 100 100">
    <path d="M86.65 48.248c-.166-.197-4.151-4.871-10.614-9.593C67.392 32.339 58.41 29 50.066 29c-8.346 0-17.326 3.339-25.972 9.655-6.462 4.722-10.448 9.396-10.614 9.593a2.023 2.023 0 000 2.613c.166.197 4.152 4.871 10.614 9.592 8.646 6.317 17.626 9.656 25.972 9.656 8.345 0 17.326-3.339 25.972-9.656 6.462-4.721 10.447-9.395 10.613-9.592a2.023 2.023 0 000-2.613zm-60.094 8.998a66.774 66.774 0 01-8.794-7.69c2.684-2.812 9.666-9.498 18.694-13.446-3.419 3.459-5.534 8.209-5.534 13.444 0 5.227 2.109 9.969 5.515 13.426-3.835-1.675-7.213-3.792-9.88-5.734zm23.509 7.407c-8.325 0-15.098-6.773-15.098-15.099 0-8.325 6.773-15.098 15.098-15.098 8.325 0 15.097 6.773 15.097 15.098 0 8.326-6.773 15.099-15.098 15.099zm23.508-7.407c-2.666 1.942-6.045 4.059-9.881 5.734 3.407-3.457 5.515-8.199 5.515-13.426 0-5.226-2.108-9.968-5.515-13.425 3.836 1.675 7.214 3.792 9.88 5.734a66.788 66.788 0 018.796 7.691 66.703 66.703 0 01-8.795 7.692zm-18.79-10.311a3.657 3.657 0 01-2.309-6.493 9.442 9.442 0 00-2.41-.322 9.434 9.434 0 00-9.434 9.434 9.435 9.435 0 1018.869 0 9.376 9.376 0 00-1.35-4.846 3.658 3.658 0 01-3.367 2.227z" />
  </svg>
);

// https://thenounproject.com/term/eye/140037/
const eyeClosedIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="M31.523 61.31a57.476 57.476 0 01-4.966-3.24 66.803 66.803 0 01-8.797-7.692 66.813 66.813 0 018.796-7.69c2.666-1.943 6.044-4.06 9.88-5.735-3.407 3.458-5.514 8.2-5.514 13.425 0 3.354.87 6.507 2.39 9.251l3.069-2.879a15.001 15.001 0 01-1.416-6.372c0-8.325 6.773-15.098 15.1-15.098 2.617 0 5.08.67 7.227 1.846l5.294-4.966c-4.25-1.54-8.462-2.336-12.521-2.336-8.346 0-17.326 3.34-25.972 9.655-6.462 4.722-10.448 9.397-10.614 9.593a2.023 2.023 0 000 2.613c.166.196 4.152 4.871 10.614 9.592a62.163 62.163 0 004.361 2.911l3.069-2.879zM86.65 49.071c-.166-.197-4.151-4.87-10.614-9.593a62.145 62.145 0 00-4.362-2.91l-3.068 2.88a57.476 57.476 0 014.967 3.238 66.788 66.788 0 018.796 7.691 66.778 66.778 0 01-8.796 7.692c-2.666 1.941-6.045 4.06-9.881 5.734 3.407-3.457 5.515-8.199 5.515-13.426 0-3.353-.87-6.506-2.39-9.25l-3.068 2.88a14.996 14.996 0 011.413 6.37c0 8.326-6.773 15.1-15.098 15.1-2.617 0-5.08-.67-7.228-1.848l-5.292 4.967c4.248 1.54 8.46 2.336 12.52 2.336 8.346 0 17.327-3.339 25.973-9.656 6.462-4.72 10.447-9.395 10.613-9.592a2.023 2.023 0 000-2.613zM50.064 59.813a9.435 9.435 0 009.435-9.435c0-.739-.093-1.455-.255-2.145L47.335 59.41a9.43 9.43 0 002.73.404zm-9.434-9.435c0 .74.093 1.456.255 2.146l11.909-11.176a9.423 9.423 0 00-2.73-.404c-5.21 0-9.434 4.224-9.434 9.434zm31.877-23.83L24.855 71.26a2.022 2.022 0 002.767 2.95l47.65-44.715a2.022 2.022 0 00-2.766-2.949z" />
  </svg>
);
