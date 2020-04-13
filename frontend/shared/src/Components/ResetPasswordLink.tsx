import {ResetPasswordLinkCss} from "frontend/shared/src/Components/ResetPasswordLink.css";
import * as React from "react";
import {PagePath} from "shared/src/Utils/PagePath";

export function ResetPasswordLink() {
  return (
    <div className={ResetPasswordLinkCss.Container}>
      <a className={ResetPasswordLinkCss.Link} href={PagePath.PasswordReset}>
        Resetare parolă
      </a>
    </div>
  );
}
