import * as React from "react";

import {PageLayout} from "Common/PageLayout";

export const HomePage = () => (
  <PageLayout title="Pagina principală" footerContent={<Footer />}>
    <div>HomePage content</div>
  </PageLayout>
);

const Footer = () => <>HomePage footer</>;
