import {ValidationMessageCss} from "frontend/shared/src/Components/FormFields/ValidationMessage.css";
import * as React from "react";

interface Props {
  text: string;
}

export function ValidationMessage(props: Props) {
  const {text} = props;

  if (!text) {
    return <></>;
  }

  return <p className={ValidationMessageCss.Text}>{text}</p>;
}
