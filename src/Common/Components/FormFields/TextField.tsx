import * as React from "react";

interface Props {
  label: string;
  id: string;
  autoFocus?: boolean;
  inputType?: InputType;
}

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType = "text" | "email" | "password";

export const TextField = (props: Props) => (
  <>
    <label htmlFor={props.id}>{props.label}:</label>
    <input type={props.inputType || "text"} id={props.id} autoFocus={!!props.autoFocus} />
  </>
);
