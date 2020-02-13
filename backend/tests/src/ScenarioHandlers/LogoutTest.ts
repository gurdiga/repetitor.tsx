import {expect} from "chai";
import {Logout} from "ScenarioHandlers/Logout";

describe("Logout", () => {
  it("removes userId from the session", async () => {
    const session = {
      userId: 42,
    };

    await Logout({}, session);
    expect(session.userId).to.be.undefined;
  });

  it("responds with success", async () => {
    const result = await Logout({}, {userId: 42});

    expect(result).to.deep.equal({kind: "LogoutSuccess"});
  });
});
