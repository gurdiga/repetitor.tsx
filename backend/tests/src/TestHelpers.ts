import {connectionPool, RowSet, runQuery} from "backend/src/Db";
import {expect, use} from "chai";
import Sinon = require("sinon");

use(require("chai-as-promised"));
use(require("chai-http"));
use(require("sinon-chai"));

process.on("unhandledRejection", (e) => {
  throw e;
});

connectionPool.config.connectionLimit = 1;

before(makeTestsTransactional);
after(expectEmptyTables);

async function makeTestsTransactional() {
  connectionPool.on("connection", (connection) => {
    beforeEach(() => {
      connection.beginTransaction((e) => expect(e).not.to.exist);
    });

    afterEach(() => {
      connection.rollback();
    });
  });

  await q(`SELECT 'Trigger "connection" above to wrap tests in a transaction';`);
}

async function expectEmptyTables() {
  const tablesToExclude = ["migrations", "sessions"];

  await q(`TRUNCATE sessions`);

  const tableNames = (await q(`SHOW TABLES`))
    .map(({Tables_in_repetitor_test: tableName}) => tableName as string)
    .filter((x) => !tablesToExclude.includes(x));

  const getRowCount = async (tableName: string) => (await q(`SELECT * FROM ${tableName}`)).length;
  const getTableTuple = async (tableName: string) => [tableName, await getRowCount(tableName)] as [string, number];

  const rowCounts = Object.fromEntries(await Promise.all(tableNames.map(getTableTuple)));
  const expectedRowCounts = Object.fromEntries(tableNames.map((n) => [n, 0]));

  // await Promise.all(tableNames.map((tableName) => q(`TRUNCATE ${tableName}`)));
  expect(rowCounts, "some tables have rows after running tests").to.deep.equal(expectedRowCounts);
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

// For misc ad-hoc queries.
export async function q(sql: string): Promise<any[]> {
  const result = (await runQuery({sql, params: []})) as RowSet;

  return result.rows;
}

export async function unregisterUser(email: string): Promise<void> {
  await q(`DELETE FROM users WHERE email = "${email}"`);
}
