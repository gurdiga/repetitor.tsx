import * as React from "react";

import {FormCss} from "./Form.css";

interface Props {
  fields: JSX.Element[];
}

export const Form = (props: Props) => (
  <form>
    <ul className={FormCss.FieldList}>
      {props.fields.map((field, i) => (
        <li key={i} className={FormCss.FieldContainer}>
          {field}
        </li>
      ))}
    </ul>
  </form>
);
