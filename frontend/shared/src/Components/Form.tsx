import {FormCss} from "frontend/shared/Components/Form.css";
import * as React from "react";

interface Props {
  fields: React.ReactElement[];
  actionButtons: React.ReactElement[];
}

export function Form(props: Props) {
  return (
    <form onSubmit={e => e.preventDefault()} className={FormCss.FormContainer} noValidate>
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
}
