import React = require("react");
import {ChangeEmailTokenErrorCode, ChangeEmailTokenErrorMessages} from "shared/src/Model/EmailChange";
import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";

interface Props {
  validationErrorCode: ChangeEmailTokenErrorCode;
}

export function TokenInvalidView(props: Props) {
  const {validationErrorCode} = props;
  const errorMessage = ChangeEmailTokenErrorMessages[validationErrorCode];

  return <AlertMessage type="error">{errorMessage}</AlertMessage>;
}
