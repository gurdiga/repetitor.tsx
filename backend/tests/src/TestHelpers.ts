import {expect, use} from "chai";
import {connectionPool, runQuery, RowSet} from "backend/src/Utils/Db";
import Sinon = require("sinon");
import {PoolConnection} from "mysql";

use(require("chai-as-promised"));
use(require("chai-http"));

process.on("unhandledRejection", e => {
  throw e;
});

connectionPool.config.connectionLimit = 1;
connectionPool.on("connection", connection => {
  beforeEach(() => {
    connection.beginTransaction(e => {
      if (e) {
        throw e;
      }
    });
  });

  afterEach(async () => connection.rollback());
});

export interface AssertionParams {
  promise: Promise<any>;
  expectedErrorMessage: string;
}

export async function assertRejectedPromise(params: AssertionParams): Promise<void> {
  const {promise, expectedErrorMessage} = params;
  let coughtException = false;

  try {
    await promise;
  } catch (error) {
    coughtException = true;
    expect(error.message).to.equal(expectedErrorMessage);
  }

  if (!coughtException) {
    expect.fail(`Promise NOT rejected with "${expectedErrorMessage}"`);
  }
}

export type Stub<T extends (...args: any) => any> = Sinon.SinonStub<Parameters<T>, ReturnType<T>>;

export function stubExport<T extends any>(
  module: T,
  functionName: keyof T,
  before: Mocha.HookFunction,
  after: Mocha.HookFunction
): void {
  let exportedFunction: Stub<any>;

  before(() => {
    exportedFunction = Sinon.stub(module, functionName);
  });

  after(() => {
    exportedFunction.restore();
  });
}

export async function q(sql: string): Promise<any> {
  const result = (await runQuery({sql, params: []})) as RowSet;

  return result.rows;
}
