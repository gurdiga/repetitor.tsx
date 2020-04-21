import React = require("react");
import {TokenInvalidView} from "frontend/pages/schimbare-email/src/TokenInvalidView";
import {TokenVerificationView} from "frontend/pages/schimbare-email/src/TokenVerificationView";
import {ChangeEmailTokenValidationRules} from "shared/src/Model/EmailChange";
import {validateWithRules} from "shared/src/Utils/Validation";

interface Props {
  token: string;
}

export function Step2(props: Props) {
  const {token} = props;
  const tokenValidationResult = validateWithRules(token, ChangeEmailTokenValidationRules);

  return (
    <>
      {tokenValidationResult.kind === "Valid" ? (
        <TokenVerificationView {...{token: tokenValidationResult.value}} />
      ) : (
        <TokenInvalidView {...{validationErrorCode: tokenValidationResult.validationErrorCode}} />
      )}
    </>
  );
}
