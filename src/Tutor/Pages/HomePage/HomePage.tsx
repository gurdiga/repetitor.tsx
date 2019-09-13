import * as React from "react";

import {PageLayout} from "Common/PageLayout";

export const HomePage = () => (
  <PageLayout footerConten={<Footer />}>
    <div>HomePage content</div>
  </PageLayout>
);

const Footer = () => <>HomePage footer</>;
