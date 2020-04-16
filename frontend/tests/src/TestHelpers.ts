import {expect} from "chai";
import {configure, ShallowWrapper} from "enzyme";
import * as Adapter from "enzyme-adapter-react-16";
import {AlertMessage, AlertType} from "frontend/shared/src/Components/AlertMessage";
import {runScenario} from "frontend/shared/src/ScenarioRunner";
import * as fs from "fs";
import * as Sinon from "sinon";
import sinonChai = require("sinon-chai");
import chai = require("chai");

configure({adapter: new Adapter()});
chai.use(sinonChai);

export type Stub<T extends (...args: any) => any> = Sinon.SinonStub<Parameters<T>, ReturnType<T>>;
export type Comp<C extends React.FunctionComponent<any>> = React.ReactElement<React.ComponentProps<C>>;
export type Wrapper<FC extends React.FunctionComponent<any>> = ShallowWrapper<React.ComponentProps<FC>>;
export type HtmlWrapper<E extends HTMLElement> = ShallowWrapper<React.HTMLAttributes<E>>;

export function find<T extends (props: any) => JSX.Element>(
  wrapper: Wrapper<(props: any) => JSX.Element>,
  childType: T
): Wrapper<T>;
export function find(wrapper: Wrapper<(props: any) => JSX.Element>, selector: string): HtmlWrapper<any>;
export function find<T extends (props: any) => JSX.Element>(
  wrapper: Wrapper<(props: any) => JSX.Element>,
  x: T | string
) {
  expect(wrapper, "the wrapper to look into").to.exist;

  if (typeof x === "string") {
    return wrapper.find(x);
  } else {
    return wrapper.find(x) as Wrapper<T>;
  }
}

// https://www.typescriptlang.org/docs/handbook/advanced-types.html#example-2
export type Unpromise<T> = T extends (infer U)[] ? U : T extends Promise<infer U> ? U : T;
export type ServerResponseSimulator = (value: Unpromise<ReturnType<typeof runScenario>>) => void;

export function expectProps<C extends React.FunctionComponent<any>>(
  subject: string,
  element: JSX.Element | Wrapper<C>,
  expectedProps: Partial<React.ComponentProps<C>>
): void {
  if (element instanceof ShallowWrapper) {
    for (const propName in expectedProps) {
      expect(element.exists(), `“${subject}” is expected to exist`).to.be.true;
      expect(
        element.prop(propName),
        `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
      ).to.deep.equal(expectedProps[propName]);
    }
  } else {
    for (const propName in expectedProps) {
      expect(
        element.props[propName],
        `“${subject}” is expected to have prop “${propName}” of “${expectedProps[propName]}”`
      ).to.deep.equal(expectedProps[propName]);
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

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function expectAlertMessage(name: string, wrapper: Wrapper<any>, type: AlertType, text: string): void {
  const alertMessage = wrapper.find(AlertMessage);

  expect(alertMessage.exists(), `${name} exists`).to.be.true;
  expect(alertMessage.props().type, `${name} type`).to.equal(type);
  expect(alertMessage.dive().text(), `${name} text`).to.equal(text);
}
