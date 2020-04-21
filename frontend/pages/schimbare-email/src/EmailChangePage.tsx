import {TokenInvalidView} from "frontend/pages/schimbare-email/src/TokenInvalidView";
import {TokenVerificationView} from "frontend/pages/schimbare-email/src/TokenVerificationView";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import {ChangeEmailTokenValidationRules} from "shared/src/Model/EmailChange";
import {PageProps} from "shared/src/Utils/PageProps";
import {validateWithRules} from "shared/src/Utils/Validation";
import React = require("react");

interface Props extends PageProps {
  params: QueryStringParams;
}

export function EmailChangePage(props: Props) {
  const {isAuthenticated, params} = props;
  const {token} = params;
  const tokenValidationResult = validateWithRules(token, ChangeEmailTokenValidationRules);

  return (
    <PageLayout {...{title: "Profil", isAuthenticated}}>
      {tokenValidationResult.kind === "Valid" ? (
        <TokenVerificationView {...{token: tokenValidationResult.value}} />
      ) : (
        <TokenInvalidView {...{validationErrorCode: tokenValidationResult.validationErrorCode}} />
      )}
    </PageLayout>
  );
}
