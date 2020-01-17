import {SubmitButtonCss} from "frontend/shared/Components/SubmitButton.css";
import * as React from "react";
import {classes} from "typestyle";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  label: string;
  onClick: () => void;
}

export const SubmitButton: React.FunctionComponent<Props> = props => {
  const {label, className, ...rest} = props;

  return (
    <button type="submit" {...rest} className={classes(SubmitButtonCss.Button, className)}>
      {props.label}
    </button>
  );
};
