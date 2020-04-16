import {AuthenticatedState} from "frontend/pages/profil/src/AuthenticatedState";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {PageProps} from "shared/src/Utils/PageProps";
import React = require("react");

export function ProfilePage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Profil", isAuthenticated}}>
      {isAuthenticated ? <AuthenticatedState /> : <NeedsAuthentication />}
    </PageLayout>
  );
}
