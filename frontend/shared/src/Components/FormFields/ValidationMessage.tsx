import {ValidationMessageCss} from "frontend/shared/Components/FormFields/ValidationMessage.css";
import * as React from "react";

interface Props {
  text: string;
}

export const ValidationMessage = (props: Props) => {
  const {text} = props;

  if (!text) {
    return <></>;
  }

  return <p className={ValidationMessageCss.Text}>{text}</p>;
};
