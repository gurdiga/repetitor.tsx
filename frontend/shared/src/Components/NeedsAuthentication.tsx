import * as React from "react";

interface Props {
  children?: React.ReactNode;
}

export function NeedsAuthentication(props: Props) {
  return (
    <div>
      {React.Children.count(props.children) > 0 ? (
        props.children
      ) : (
        <p>Pentru a acccesa această pagină trebuie mai întîi să vă autentificați.</p>
      )}
    </div>
  );
}
