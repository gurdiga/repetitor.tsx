import * as React from "react";
import {expect} from "chai";
import {shallow, ShallowWrapper} from "enzyme";
import {expectToRenderSnapshot, Wrapper, expectProps, HtmlWrapper} from "TestHelpers";
import {PasswordField} from "frontend/shared/Components/FormFields/PasswordField";
import {ValidationMessage} from "frontend/shared/Components/FormFields/ValidationMessage";
import {passwordErrorMessages, UserPasswordValidationRules} from "shared/Model/User";
import {PasswordFieldCss} from "frontend/shared/Components/FormFields/PasswordField.css";

describe("<PasswordField/>", () => {
  const defaultProps = {
    id: "pass",
    label: "Password please",
    value: "",
    validationRules: UserPasswordValidationRules,
    onValueChange: () => null,
    showValidationMessage: false,
    validationMessages: passwordErrorMessages,
  };

  describe("rendering", () => {
    it("renders the initial state", () => {
      const wrapper = render();
      const input = wrapper.find("input");
      const generateButton = wrapper.find(`button.${PasswordFieldCss.GenerateButton}`);
      const unmaskButton = wrapper.find(`button.${PasswordFieldCss.EyeButton}`);
      const validationMessage = wrapper.find(ValidationMessage) as Wrapper<typeof ValidationMessage>;

      expectProps("input", input, {
        type: "password",
        id: defaultProps.id,
      });

      expect(generateButton.exists(), "does NOT renders the “generate” button").to.be.false;
      expect(unmaskButton.exists(), "renders the “unmask” button").to.be.true;
      expect(validationMessage.exists(), "does NOT render the validation message").to.be.false;
      expectToRenderSnapshot(__filename, wrapper, "initial-state");
    });

    it("renders the validation message", () => {
      const wrapper = render({showValidationMessage: true});
      const validationMessage = wrapper.find(ValidationMessage) as Wrapper<typeof ValidationMessage>;

      expectProps("validation message", validationMessage, {
        text: passwordErrorMessages["REQUIRED"],
      });
      expectToRenderSnapshot(__filename, wrapper, "with-validation-message");
    });

    it("can render with no generate button", () => {
      const wrapper = render({hasGenerateButton: false});
      const generateButton = wrapper.find(`button.${PasswordFieldCss.GenerateButton}`);

      expect(generateButton.exists()).to.be.false;
      expectToRenderSnapshot(__filename, wrapper, "with-no-generate-button");
    });
  });

  describe("behavior", () => {
    let wrapper: Wrapper<typeof PasswordField>;
    let unmaskButton: HtmlWrapper<HTMLButtonElement>;
    let generateButton: HtmlWrapper<HTMLButtonElement>;

    before(() => {
      wrapper = render({hasGenerateButton: true});
      unmaskButton = wrapper.find(`button.${PasswordFieldCss.EyeButton}`);
      generateButton = wrapper.find(`button.${PasswordFieldCss.GenerateButton}`);
    });

    it("unmasks the password text when clicking the “unmask” button", () => {
      unmaskButton.simulate("click");

      expectProps("input", wrapper.find("input"), {
        type: "text",
      });
    });

    describe("“generate” button", () => {
      it("generates a pseudo-random password", () => {
        generateButton.simulate("click");

        const generatedPassword = getGeneratedPassword();
        expect(generatedPassword).not.to.be.empty;
      });

      it("generates unique passwords", () => {
        const generatedPasswords = Array(20)
          .fill("")
          .map(() => {
            generateButton.simulate("click");
            return getGeneratedPassword();
          });
        const distinctPasswords = generatedPasswords.filter(uniq);

        expect(generatedPasswords, "passwords are uniq").to.deep.equal(distinctPasswords);
      });

      function getGeneratedPassword() {
        return wrapper.find("input").prop("value");
      }
    });
  });

  function render(
    specificProps: Partial<React.ComponentProps<typeof PasswordField>> = {}
  ): Wrapper<typeof PasswordField> {
    return shallow(<PasswordField {...{...defaultProps, ...specificProps}} />);
  }

  function uniq<T extends any>(value: T, index: number, self: T[]) {
    return self.indexOf(value) === index;
  }
});
