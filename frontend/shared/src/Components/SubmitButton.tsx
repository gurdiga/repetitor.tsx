import * as React from "react";
import {classes} from "typestyle";
import {SubmitButtonCss} from "./SubmitButton.css";

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  label: string;
}

export const SubmitButton = (props: Props) => {
  const {label, className, ...rest} = props;

  return (
    <button type="submit" {...rest} className={classes(SubmitButtonCss.Button, className)}>
      {props.label}
    </button>
  );
};
