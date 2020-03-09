import {expect} from "chai";
import {configure, ShallowWrapper, shallow} from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import * as Sinon from "sinon";
import * as fs from "fs";

configure({adapter: new Adapter()});

export type Stub<T extends (...args: any) => any> = Sinon.SinonStub<Parameters<T>, ReturnType<T>>;
export type Comp<C extends React.FunctionComponent<any>> = React.ReactElement<React.ComponentProps<C>>;
export type Wrapper<FC extends React.FunctionComponent<any>> = ShallowWrapper<React.ComponentProps<FC>>;
export type HtmlWrapper<E extends HTMLElement> = ShallowWrapper<React.HTMLAttributes<E>>;

export function expectProps<C extends React.FunctionComponent<any>>(
  subject: string,
  field: JSX.Element | Wrapper<C>,
  expectedProps: Partial<React.ComponentProps<C>>
): void {
  if (field instanceof ShallowWrapper) {
    for (const propName in expectedProps) {
      expect(field.exists(), `“${subject}” is expected to exist`).to.be.true;
      expect(
        field.prop(propName),
        `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
      ).to.equal(expectedProps[propName]);
    }
  } else {
    for (const propName in expectedProps) {
      expect(
        field.props[propName],
        `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
      ).to.equal(expectedProps[propName]);
    }
  }
}

export function expectToRenderSnapshot(testFileName: string, wrapper: Wrapper<any>, slug = "default"): void {
  const snapshotFile = `${testFileName}.snapshot.${slug}`;
  const snapshotContent = wrapper.debug();

  if (fs.existsSync(snapshotFile)) {
    const assertionMessage = `Snapshot file: [ ${snapshotFile} ]`;
    expect(fs.readFileSync(snapshotFile, "utf8"), assertionMessage).to.equal(snapshotContent);
  } else {
    fs.writeFileSync(snapshotFile, snapshotContent);
  }
}
