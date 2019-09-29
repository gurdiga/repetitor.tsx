import * as React from "react";

import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordFieldCss} from "Common/Components/FormFields/PasswordField.css";
import {Checkbox} from "Common/Components/FormFields/Checkbox";
import {FormField} from "Common/Components/FormFields/FormField";
import {FormValidation} from "Common/FormValidation";

interface Props extends FormField.CommonProps {}

const validationRules: FormValidation.ValidationRules = {
  "Can’t be empty": value => !!value,
};

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
