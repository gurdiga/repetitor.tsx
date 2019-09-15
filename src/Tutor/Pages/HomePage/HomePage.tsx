import * as React from "react";

import {PageLayout} from "Common/PageLayout";

export const HomePage = () => {
  React.useEffect(() => {
    document.title = "Pagina principală";
  });

  return (
    <PageLayout footerConten={<Footer />}>
      <div>HomePage content</div>
    </PageLayout>
  );
};

const Footer = () => <>HomePage footer</>;
