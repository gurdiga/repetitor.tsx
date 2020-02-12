import {PageLayout} from "frontend/shared/PageLayout";
import * as React from "react";
import {PageProps} from "shared/Utils/PageProps";

export function HomePage(props: PageProps) {
  return (
    <PageLayout title="Pagina principală" footerContent={<Footer />}>
      <div>HomePage content</div>
      <pre>{JSON.stringify(props)}</pre>
    </PageLayout>
  );
}

function Footer() {
  return <>HomePage footer</>;
}
