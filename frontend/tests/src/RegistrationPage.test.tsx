import {expect} from "chai";
import {shallow, ShallowWrapper} from "enzyme";
import * as ActionHandling from "frontend/shared/ActionHandling";
import {Form} from "frontend/shared/Components/Form";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {SubmitButton} from "frontend/shared/Components/SubmitButton";
import {PageLayout} from "frontend/shared/PageLayout";
import {describe, it} from "mocha";
import * as React from "react";
import {RegistrationPage} from "RegistrationPage";
import {ValidationRules} from "shared/Validation";
import {stub} from "sinon";
import {Stub} from "TestHelpers";

describe("<RegistrationPage/>", () => {
  let wrapper: ShallowWrapper<React.ComponentProps<typeof RegistrationPage>, {}>;

  before(() => {
    wrapper = shallow(<RegistrationPage />);
  });

  it("renders the page layout with the appropriate title", () => {
    const layout = wrapper.find(PageLayout);

    expect(layout).to.exist;
    expect(layout.prop("title")).to.equal("Înregistrare tutore");
  });

  it("renders a form with the appropriate fields", () => {
    const form = wrapper.find(Form);
    const {fields} = form.props();
    const validationRules = ValidationRules["RegisterUser"];

    assertProps<typeof TextField>("numele deplin", fields[0], {
      label: "Nume deplin",
      autoFocus: true,
      validationRules: validationRules.fullName,
    });

    assertProps<typeof TextField>("adresa de email", fields[1], {
      label: "Adresa de email",
      inputType: "email",
      validationRules: validationRules.email,
    });

    assertProps<typeof PasswordField>("parola", fields[2], {
      label: "Parola",
      validationRules: validationRules.password,
    });
  });

  it("renders the appropriate action buttons", () => {
    const submitButton = getSubmitButton(wrapper);

    assertProps<typeof SubmitButton>("parola", submitButton, {
      label: "Înregistrează",
    });
  });

  context("behavior", () => {
    let postActionStub: Stub<typeof ActionHandling.postAction>;

    beforeEach(() => {
      // TODO: implement the unhappy path test too.
      postActionStub = stub(ActionHandling, "postAction").resolves({success: true});
    });

    afterEach(() => {
      postActionStub.restore();
    });

    it("submits the field values to the backend", () => {
      const form = wrapper.find(Form);
      const {fields} = form.props();

      (fields[0] as Comp<typeof TextField>).props.onValueChange({
        text: "full name",
        isValid: true,
      });

      (fields[1] as Comp<typeof TextField>).props.onValueChange({
        text: "email@example.com",
        isValid: true,
      });

      (fields[2] as Comp<typeof PasswordField>).props.onValueChange({
        text: "password",
        isValid: true,
      });

      getSubmitButton(wrapper).props.onClick();
      expect(ActionHandling.postAction).to.have.been.called;
    });
  });

  type Comp<T extends React.FunctionComponent<any>> = React.ReactElement<React.ComponentProps<T>>;

  function getSubmitButton(
    wrapper: ShallowWrapper<React.ComponentProps<typeof RegistrationPage>, {}>
  ): React.ReactElement<React.ComponentProps<typeof SubmitButton>> {
    return wrapper.find(Form).props().actionButtons[0];
  }

  function assertProps<C extends React.FunctionComponent<any>>(
    subject: string,
    field: JSX.Element,
    props: Partial<React.ComponentProps<C>>
  ): void {
    for (const propName in props) {
      expect(
        field.props[propName],
        `The field “${subject}” is expected to have prop “${propName}” of “${props[propName]}”`
      ).to.equal(props[propName]);
    }
  }
});
