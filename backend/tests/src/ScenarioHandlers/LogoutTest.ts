import {expect} from "chai";
import {Logout} from "ScenarioHandlers/Logout";

describe("Logout", () => {
  it("removes userId from the session", async () => {
    const session = {userId: 42, email: "some@email.com"};

    await Logout({}, session);
    expect(session.userId, "purges userId").to.be.undefined;
    expect(session.email, "purges email").to.be.undefined;
  });

  it("responds with success", async () => {
    const result = await Logout({}, {userId: 42});

    expect(result).to.deep.equal({kind: "LogoutSuccess"});
  });
});
