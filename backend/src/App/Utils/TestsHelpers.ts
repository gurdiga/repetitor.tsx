import {connectionPool, runQuery} from "App/DB";

after(async () => {
  await truncateAllTables();

  connectionPool.end(error => {
    if (error) {
      console.error("Error when ending connection pool", error);
    }
  });
});

async function truncateAllTables(): Promise<void> {
  const {rows} = await runQuery({sql: "SHOW TABLES", params: []});
  const operations = rows
    .map(row => Object.values(row)[0])
    .map(tableName => {
      return runQuery({sql: "TRUNCATE TABLE ??", params: [tableName]});
    });

  await Promise.all(operations);
}
