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
  Pending,
  Success,
  Error,
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
    setStatus(Status.Pending);
    await onClick()
      .then(() => {
        setStatus(Status.Success);
        setTimeout(() => {
          // Give it time to pop 3 times
          setStatus(Status.Steady);
        }, 1500);
      })
      .catch(() => setStatus(Status.Error))
      .finally(() => toggleDisabled(false));
  }

  function getIllustration(status: Status) {
    switch (status) {
      case Status.Steady:
        return <></>;
      case Status.Pending:
        return <span className={classes(SubmitButtonCss.Illustration, SubmitButtonCss.IllustrationPending)}>+</span>;
      case Status.Success:
        return <span className={classes(SubmitButtonCss.Illustration, SubmitButtonCss.IllustrationSuccess)}>👍</span>;
      case Status.Error:
        return <span className={SubmitButtonCss.Illustration}>😵</span>;
    }
  }
}
