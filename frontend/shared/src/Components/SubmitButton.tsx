import {SubmitButtonCss} from "frontend/shared/src/Components/SubmitButton.css";
import * as React from "react";
import {classes} from "typestyle";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  label: string;
  onClick: () => Promise<void>;
}

export function SubmitButton(props: Props) {
  const {label, onClick, className, ...rest} = props;
  const [isDisabled, toggleDisabled] = React.useState(false);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      onClick={handleClick}
      {...rest}
      className={classes(SubmitButtonCss.Button, className)}
    >
      {props.label}
    </button>
  );

  async function handleClick() {
    toggleDisabled(true);
    await onClick().finally(() => toggleDisabled(false));
  }
}
