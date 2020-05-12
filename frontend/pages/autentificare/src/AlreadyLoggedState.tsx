import {AlreadyLoggedIn} from "frontend/shared/src/Components/AlreadyLoggedIn";
import React = require("react");

export function AlreadyLoggedInState() {
  return (
    <AlreadyLoggedIn>
      <p>Deja v-ați autentificat.</p>
      <p>Dacă doriți să vă dezautentifcați, apăsați pe acest buton:</p>
    </AlreadyLoggedIn>
  );
}
