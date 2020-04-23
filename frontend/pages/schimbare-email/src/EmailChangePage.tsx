import {AuthenticatedState} from "frontend/pages/schimbare-email/src/AuthenticatedState";
import {NeedsAuthentication} from "frontend/shared/src/Components/NeedsAuthentication";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import {PageProps} from "shared/src/Utils/PageProps";
import React = require("react");

interface Props extends PageProps {
  params: QueryStringParams;
}

export function EmailChangePage(props: Props) {
  const {isAuthenticated, email, params} = props;

  return (
    <PageLayout {...{title: "Schimare email", isAuthenticated}}>
      {isAuthenticated ? (
        <AuthenticatedState {...{currentEmail: email! /* because of isAuthenticated*/, params}} />
      ) : (
        <NeedsAuthentication />
      )}
    </PageLayout>
  );
}
