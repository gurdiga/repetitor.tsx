import {SecondaryButtonCss} from "frontend/shared/src/Components/SecondaryButton.css";
import * as React from "react";
import {classes} from "typestyle";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  label: string;
  onClick: () => Promise<void>;
}

export function SecondaryButton(props: Props) {
  const {label, onClick, className, ...rest} = props;
  const [isDisabled, toggleDisabled] = React.useState(false);

  return (
    <button
      type="button"
      disabled={isDisabled}
      onClick={handleClick}
      {...rest}
      className={classes(SecondaryButtonCss.Button, className)}
    >
      {props.label}
    </button>
  );

  async function handleClick() {
    toggleDisabled(true);
    await onClick().finally(() => toggleDisabled(false));
  }
}
