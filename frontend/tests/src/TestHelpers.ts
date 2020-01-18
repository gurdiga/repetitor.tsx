import * as chai from "chai";
import * as chaiEnzyme from "chai-enzyme";
import {configure} from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as Sinon from "sinon";
import * as sinonChai from "sinon-chai";

configure({adapter: new Adapter()});
chai.use(chaiEnzyme());
chai.use(sinonChai);

export type Stub<T extends (...args: any) => any> = Sinon.SinonStub<Parameters<T>, ReturnType<T>>;
