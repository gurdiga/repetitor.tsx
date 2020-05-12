import {AlreadyLoggedInState} from "frontend/pages/autentificare/src/AlreadyLoggedState";
import {LoginForm} from "frontend/pages/autentificare/src/LoginForm";
import {PageLayout} from "frontend/shared/src/PageLayout";
import * as React from "react";
import {PageProps} from "shared/src/Utils/PageProps";

export function LoginPage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Autentificare repetitor", isAuthenticated}}>
      {props.isAuthenticated ? <AlreadyLoggedInState /> : <LoginForm />}
    </PageLayout>
  );
}
