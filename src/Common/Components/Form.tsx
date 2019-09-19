import * as React from "react";

import {FormCss} from "./Form.css";

interface Props {
  fields: JSX.Element[];
  actionButtons: JSX.Element[];
}

export const Form = (props: Props) => (
  <form onSubmit={e => e.preventDefault()} className={FormCss.FormContainer}>
    <ul className={FormCss.FieldListContainer}>
      {props.fields.map((field, i) => (
        <li key={i} className={FormCss.FieldContainer}>
          {field}
        </li>
      ))}
    </ul>
    <ul className={FormCss.ActionButtonListContainer}>
      {props.actionButtons.map((actionButton, i) => (
        <li key={i}>{actionButton}</li>
      ))}
    </ul>
  </form>
);
