import * as React from "react";
import {PageLayout} from "../../../shared/src/PageLayout";

export const HomePage = () => (
  <PageLayout title="Pagina principală" footerContent={<Footer />}>
    <div>HomePage content</div>
  </PageLayout>
);

const Footer = () => <>HomePage footer</>;
