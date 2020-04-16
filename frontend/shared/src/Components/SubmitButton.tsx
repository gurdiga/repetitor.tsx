import {SubmitButtonCss} from "frontend/shared/src/Components/SubmitButton.css";
import * as React from "react";
import {classes} from "typestyle";

type BuiltinButtonProps = React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

interface Props extends BuiltinButtonProps {
  label: string;
  onClick: () => Promise<void>;
}

enum Status {
  Steady,
  Submitted,
}

export function SubmitButton(props: Props) {
  const {label, onClick, className, ...rest} = props;
  const [isDisabled, toggleDisabled] = React.useState(false);
  const [status, setStatus] = React.useState<Status>(Status.Steady);

  return (
    <button
      type="submit"
      disabled={isDisabled}
      onClick={handleClick}
      {...rest}
      className={classes(SubmitButtonCss.Button, className)}
    >
      {props.label}
      {getIllustration(status)}
    </button>
  );

  async function handleClick() {
    toggleDisabled(true);
    setStatus(Status.Submitted);

    try {
      await onClick();
    } catch (error) {
      console.error(error);
    }

    setStatus(Status.Steady);
    setTimeout(() => toggleDisabled(false), 1000);
  }

  function getIllustration(status: Status) {
    switch (status) {
      case Status.Steady:
        return <></>;
      case Status.Submitted:
        return <span className={classes(SubmitButtonCss.Illustration, SubmitButtonCss.IllustrationSubmitted)}>+</span>;
    }
  }
}
