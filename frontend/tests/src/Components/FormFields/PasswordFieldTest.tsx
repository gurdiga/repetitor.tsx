import {expect} from "chai";
import {shallow} from "enzyme";
import {PasswordField} from "frontend/shared/src/Components/FormFields/PasswordField";
import {PasswordFieldCss} from "frontend/shared/src/Components/FormFields/PasswordField.css";
import {ValidationMessage} from "frontend/shared/src/Components/FormFields/ValidationMessage";
import * as React from "react";
import {PasswordErrorMessages, PasswordValidationRules} from "shared/src/Model/Password";
import {expectProps, expectToRenderSnapshot, HtmlWrapper, Wrapper, find} from "frontend/tests/src/TestHelpers";

describe("<PasswordField/>", () => {
  const defaultProps = {
    id: "pass",
    label: "Password please",
    value: "",
    validationRules: PasswordValidationRules,
    onValueChange: () => null,
    showValidationMessage: false,
    validationMessages: PasswordErrorMessages,
  };

  describe("rendering", () => {
    it("renders the initial state", () => {
      const wrapper = render();
      const generateButton = find(wrapper, `button.${PasswordFieldCss.GenerateButton}`);
      const unmaskButton = find(wrapper, `button.${PasswordFieldCss.EyeButton}`);
      const validationMessage = find(wrapper, ValidationMessage);

      expectProps("input", wrapper.find("input"), {
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
      const validationMessage = find(wrapper, ValidationMessage);

      expectProps("validation message", validationMessage, {
        text: PasswordErrorMessages["REQUIRED"],
      });
      expectToRenderSnapshot(__filename, wrapper, "with-validation-message");
    });

    it("can render with no generate button", () => {
      const wrapper = render({hasGenerateButton: false});
      const generateButton = find(wrapper, `button.${PasswordFieldCss.GenerateButton}`);

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
      unmaskButton = find(wrapper, `button.${PasswordFieldCss.EyeButton}`);
      generateButton = find(wrapper, `button.${PasswordFieldCss.GenerateButton}`);
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
