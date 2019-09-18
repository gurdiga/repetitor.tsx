import * as React from "react";

import {TextField} from "Common/Components/FormFields/TextField";
import {PasswordFieldCss} from "Common/Components/FormFields/PasswordField.css";
import {Checkbox} from "Common/Components/FormFields/Checkbox";

interface Props {
  id: string;
  label: string;
}

export const PasswordField = (props: Props) => {
  const [isPasswordShown, setIsPasswordShown] = React.useState(true);

  return (
    <>
      <TextField id={props.id} label={props.label} inputType={isPasswordShown ? "text" : "password"} />
      <Checkbox
        id={`${props.id}-show`}
        isChecked={isPasswordShown}
        label="Afișează parola"
        onChange={setIsPasswordShown}
      />
    </>
  );
};
