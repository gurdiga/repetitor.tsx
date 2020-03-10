import * as React from "react";
import {SpinnerCss} from "frontend/shared/Components/Spinner.css";

export function Spinner() {
  return (
    <div className={SpinnerCss.Container}>
      <div className={`loader ${SpinnerCss.Loader}`}>Loading...</div>
    </div>
  );
}
