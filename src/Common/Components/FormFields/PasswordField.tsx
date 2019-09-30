import * as React from "react";

import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordFieldCss} from "Common/Components/FormFields/PasswordField.css";
import {Checkbox} from "Common/Components/FormFields/Checkbox";
import {FormField} from "Common/Components/FormFields/FormField";
import {FormValidation} from "Common/FormValidation";

interface Props extends FormField.CommonProps {}

export const PasswordField = (props: Props) => {
  const {id, label, value, onValueChange, showValidationMessage} = props;

  const [shouldUnmaskPassword, setShouldUnmaskPassword] = React.useState(false);

  return (
    <>
      <TextField
        id={id}
        label={label}
        value={value}
        inputType={shouldUnmaskPassword ? "text" : "password"}
        onValueChange={onValueChange}
        validationRules={validationRules}
        showValidationMessage={showValidationMessage}
      />
      <button className={PasswordFieldCss.EyeButton}>{eye}</button>
      <Checkbox
        id={`${id}-show`}
        checked={shouldUnmaskPassword}
        label="Demascați parola"
        onChange={e => setShouldUnmaskPassword(e.target.checked)}
        className={PasswordFieldCss.ShowPasswordCheckbox}
      />
    </>
  );
};

const validationRules: FormValidation.ValidationRules = {
  "Can’t be empty": value => !!value,
};

const eye = (
  <img
    src={`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1 -18.982 100 100" overflow="visible">
 <path d="M49 62.035c-26.167 0-46.674-27.814-47.535-28.999L0 31.018l1.465-2.019C2.326 27.814 22.833 0 49 0c26.166 0 46.674 27.814 47.534 28.999L98 31.018l-1.466 2.019C95.674 34.221 75.166 62.035 49 62.035zM8.616 31.014C13.669 37.151 30.117 55.166 49 55.166c18.928 0 35.339-18.006 40.386-24.145C84.331 24.883 67.885 6.869 49 6.869c-18.928 0-35.339 18.005-40.384 24.145z"/>
 <circle cx="49" cy="31.018" r="18.997"/>
</svg>`}
    alt="Demască parola"
    title="Demască parola"
  />
);
