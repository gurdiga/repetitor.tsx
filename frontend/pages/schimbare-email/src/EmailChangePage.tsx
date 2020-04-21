import {Step1} from "frontend/pages/schimbare-email/src/Step1";
import {Step2} from "frontend/pages/schimbare-email/src/Step2";
import {PageLayout} from "frontend/shared/src/PageLayout";
import {QueryStringParams} from "frontend/shared/src/Utils/QueryStringParams";
import {PageProps} from "shared/src/Utils/PageProps";
import React = require("react");

interface Props extends PageProps {
  params: QueryStringParams;
}

export function EmailChangePage(props: Props) {
  const {isAuthenticated, params} = props;

  return (
    <PageLayout {...{title: "Schimare email", isAuthenticated}}>
      {"token" in params ? <Step2 {...{token: params.token}} /> : <Step1 />}
    </PageLayout>
  );
}
