import * as chai from "chai";
import {expect} from "chai";
import {configure, ShallowWrapper} from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as Sinon from "sinon";
import * as sinonChai from "sinon-chai";

configure({adapter: new Adapter()});
chai.use(sinonChai);

export type Stub<T extends (...args: any) => any> = Sinon.SinonStub<Parameters<T>, ReturnType<T>>;
export type Comp<C extends React.FunctionComponent<any>> = React.ReactElement<React.ComponentProps<C>>;
export type Wrapper<FC extends React.FunctionComponent<any>> = ShallowWrapper<React.ComponentProps<FC>>;

export function assertProps<C extends React.FunctionComponent<any>>(
  subject: string,
  field: JSX.Element,
  expectedProps: Partial<React.ComponentProps<C>>
): void {
  for (const propName in expectedProps) {
    expect(
      field.props[propName],
      `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
    ).to.equal(expectedProps[propName]);
  }
}
