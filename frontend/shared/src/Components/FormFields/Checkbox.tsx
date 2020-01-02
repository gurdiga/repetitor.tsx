import * as React from "react";
import {classes} from "typestyle";
import {CheckboxCss} from "./Checkbox.css";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export const Checkbox = (props: Props) => {
  const {id, label, className, ...rest} = props;

  return (
    <div className={classes(CheckboxCss.Container, className)}>
      <input id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
};
