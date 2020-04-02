import {PageLayout} from "frontend/shared/src/PageLayout";
import * as React from "react";
import {PageProps} from "shared/src/Utils/PageProps";

export function HomePage(props: PageProps) {
  const {isAuthenticated} = props;

  return (
    <PageLayout {...{title: "Pagina principală", isAuthenticated}}>
      <div>HomePage content</div>
    </PageLayout>
  );
}
