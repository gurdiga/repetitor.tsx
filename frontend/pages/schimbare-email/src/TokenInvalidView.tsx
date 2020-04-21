import React = require("react");
import {ChangeEmailTokenErrorCode} from "shared/src/Model/EmailChange";

interface Props {
  validationErrorCode: ChangeEmailTokenErrorCode;
}

export function TokenInvalidView(props: Props) {
  return (
    <code>
      &lt;TokenInvalidView {"{"}
      {JSON.stringify(props)}
      {"}"}/&gt;
    </code>
  );
}
