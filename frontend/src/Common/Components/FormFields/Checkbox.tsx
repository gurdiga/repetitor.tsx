import * as React from "react";
import {CheckboxCss} from "Common/Components/FormFields/Checkbox.css";
import {classes} from "typestyle";

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
