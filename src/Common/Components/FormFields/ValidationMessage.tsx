import * as React from "react";

import {ValidationMessageCss} from "Common/Components/FormFields/ValidationMessage.css";

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
