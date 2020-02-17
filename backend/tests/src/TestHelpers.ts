import {expect, use} from "chai";
import {connectionPool, runQuery, RowSet} from "../../src/Utils/Db";

use(require("chai-as-promised"));
use(require("chai-http"));

process.on("unhandledRejection", e => {
  throw e;
});

after(async () => {
  await truncateAllTables();

  connectionPool.end(error => {
    if (error) {
      console.error("Error when ending connection pool", error);
    }
  });
});

async function truncateAllTables(): Promise<void> {
  const {rows} = (await runQuery({sql: "SHOW TABLES", params: []})) as RowSet;
  const operations = rows
    .map(row => Object.values(row)[0])
    .map(tableName => {
      return runQuery({sql: "TRUNCATE TABLE ??", params: [tableName]});
    });

  await Promise.all(operations);
}

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
