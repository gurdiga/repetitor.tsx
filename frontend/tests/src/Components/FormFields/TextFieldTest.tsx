import {expect} from "chai";
import {shallow} from "enzyme";
import * as React from "react";
import {TextField} from "frontend/shared/Components/FormFields/TextField";
import {PredicateFn, UserValue, ValidationMessages} from "shared/Utils/Validation";
import {expectToRenderSnapshot, Wrapper} from "TestHelpers";

type SampleErrorCode = "REQUIRED" | "TOO_SHORT" | "TOO_LONG";

const sampleValidationRules: Record<SampleErrorCode, PredicateFn> = {
  REQUIRED: (text: UserValue) => !!text && text.trim().length > 0,
  TOO_SHORT: (text: UserValue) => !!text && text.trim().length >= 5,
  TOO_LONG: (text: UserValue) => !!text && text.trim().length <= 50,
};

const sampleErrorMessages: ValidationMessages<typeof sampleValidationRules> = {
  REQUIRED: "Numele lipsește",
  TOO_SHORT: "Numele este prea scurt",
  TOO_LONG: "Numele este prea lung",
};

describe("<TextField/>", () => {
  describe("snapshots", () => {
    it("renders the state with errors", () => {
      const wrapper = render({showValidationMessage: true});

      expectToRenderSnapshot(__filename, wrapper, "with-errors");
    });

    it("renders the state without errors", () => {
      const wrapper = render({showValidationMessage: false});

      expectToRenderSnapshot(__filename, wrapper, "without-errors");
    });
  });

  function render(propOverrides: Partial<React.ComponentProps<typeof TextField>>): Wrapper<typeof TextField> {
    const props: React.ComponentProps<typeof TextField> = {
      id: "firstName",
      label: "First name",
      value: "",
      validationRules: sampleValidationRules,
      onValueChange: () => null,
      showValidationMessage: false,
      validationMessages: sampleErrorMessages,
      info: "Va fi afișat pe pagina dumneavoastră de profil",
    };

    return shallow(<TextField {...{...props, ...propOverrides}} />);
  }
});
