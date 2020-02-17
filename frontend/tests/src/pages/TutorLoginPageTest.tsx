import {shallow} from "enzyme";
import * as React from "react";
import {expectToRenderSnapshot} from "TestHelpers";
import {TutorLoginPage} from "TutorLoginPage";

describe("<TutorLoginPage/>", () => {
  describe("snapshots", () => {
    it("renders the authenticated state", () => {
      const wrapper = shallow(<TutorLoginPage isAuthenticated={true} />);

      expectToRenderSnapshot(__filename, wrapper, "authenticated");
    });

    it("renders the unauthenticated state", () => {
      const wrapper = shallow(<TutorLoginPage isAuthenticated={false} />);

      expectToRenderSnapshot(__filename, wrapper, "unauthenticated");
    });
  });
});
