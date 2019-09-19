import * as React from "react";

import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordFieldCss} from "Common/Components/FormFields/PasswordField.css";
import {Checkbox} from "Common/Components/FormFields/Checkbox";

interface Props {
  id: string;
  label: string;
}

export const PasswordField = (props: Props) => {
  const [shouldUnmaskPassword, setShouldUnmaskPassword] = React.useState(false);

  return (
    <>
      <TextField id={props.id} label={props.label} inputType={shouldUnmaskPassword ? "text" : "password"} />
      <Checkbox
        id={`${props.id}-show`}
        checked={shouldUnmaskPassword}
        label="Demascați parola"
        onChange={e => setShouldUnmaskPassword(e.target.checked)}
        className={PasswordFieldCss.ShowPasswordCheckbox}
      />
    </>
  );
};
