import {AlertMessage} from "frontend/shared/src/Components/AlertMessage";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import * as React from "react";
import {
  EmailConfirmationTokenErrorMessages,
  EmailConfirmationTokenValidationErrorCode,
  EmailConfirmationTokenValidationRules,
} from "shared/src/Model/EmailConfirmation";
import {PageProps} from "shared/src/Utils/PageProps";
import {validateWithRules} from "shared/src/Utils/Validation";

interface Props extends PageProps {
  params: QueryStringParams;
}

export function EmailConfirmationPage(props: Props) {
  const {token} = props.params;
  const tokenValidationResult = validateWithRules(token, EmailConfirmationTokenValidationRules);

  return (
    <PageLayout title="Confirmare email">
      {tokenValidationResult.kind === "Valid"
        ? renderTokenVerificationView(token)
        : renderTokenInvalidView(tokenValidationResult.validationErrorCode)}
    </PageLayout>
  );
}

function renderTokenVerificationView(token: string) {
  return `Verifying token: ${token}`;
}

function renderTokenInvalidView(validationErrorCode: EmailConfirmationTokenValidationErrorCode) {
  return <AlertMessage type="error">{EmailConfirmationTokenErrorMessages[validationErrorCode]}</AlertMessage>;
}
