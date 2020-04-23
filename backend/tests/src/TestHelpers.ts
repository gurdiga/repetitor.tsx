import {connectionPool, RowSet, runQuery} from "backend/src/Utils/Db";
import {expect, use} from "chai";
import Sinon = require("sinon");

use(require("chai-as-promised"));
use(require("chai-http"));

process.on("unhandledRejection", (e) => {
  throw e;
});

connectionPool.config.connectionLimit = 1;

before(async () => {
  connectionPool.on("connection", (connection) => {
    beforeEach(() => {
      connection.beginTransaction((e) => {
        if (e) throw e;
      });
    });

    afterEach(() => {
      connection.rollback();
    });
  });

  await q(`SELECT 'Trigger "connection" above to wrap tests in a transation';`);
});

interface AssertionParams {
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
  beforeHook: Mocha.HookFunction,
  afterHook: Mocha.HookFunction
): void {
  let exportedFunction: Stub<any>;

  beforeHook(() => {
    exportedFunction = Sinon.stub(module, functionName);
  });

  afterHook(() => {
    exportedFunction.restore();
  });
}

// Run ad-hoc queries
export async function q(sql: string): Promise<any[]> {
  const result = (await runQuery({sql, params: []})) as RowSet;

  return result.rows;
}
