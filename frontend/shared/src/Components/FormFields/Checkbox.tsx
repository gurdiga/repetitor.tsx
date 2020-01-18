import {CheckboxCss} from "frontend/shared/Components/FormFields/Checkbox.css";
import * as React from "react";
import {classes} from "typestyle";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

export function Checkbox(props: Props) {
  const {id, label, className, ...rest} = props;

  return (
    <div className={classes(CheckboxCss.Container, className)}>
      <input id={id} type="checkbox" {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
}
