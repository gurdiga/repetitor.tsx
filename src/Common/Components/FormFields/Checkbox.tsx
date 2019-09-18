import * as React from "react";
import {CheckboxCss} from "Common/Components/FormFields/Checkbox.css";

interface Props {
  id: string;
  label: string;
  isChecked: boolean;
  onChange: (newState: boolean) => void;
}

export const Checkbox = (props: Props) => (
  <div className={CheckboxCss.Container}>
    <input id={props.id} type="checkbox" checked={props.isChecked} onChange={e => props.onChange(e.target.checked)} />
    <label htmlFor={props.id}>{props.label}</label>
  </div>
);
