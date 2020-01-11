import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";

export const HomePage = () => (
  <PageLayout title="Pagina principală" footerContent={<Footer />}>
    <div>HomePage content</div>
  </PageLayout>
);

const Footer = () => <>HomePage footer</>;
