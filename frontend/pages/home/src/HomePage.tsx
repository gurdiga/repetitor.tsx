import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";

export function HomePage() {
  return (
    <PageLayout title="Pagina principală" footerContent={<Footer />}>
      <div>HomePage content</div>
    </PageLayout>
  );
}

function Footer() {
  return <>HomePage footer</>;
}
