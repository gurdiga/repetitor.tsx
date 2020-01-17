import {ValidationMessageCss} from "frontend/shared/Components/FormFields/ValidationMessage.css";
import * as React from "react";

interface Props {
  text: string;
}

export const ValidationMessage: React.FunctionComponent<Props> = props => {
  const {text} = props;

  if (!text) {
    return <></>;
  }

  return <p className={ValidationMessageCss.Text}>{text}</p>;
};
