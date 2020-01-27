import {runScenario} from "./Utils/Backend";
import {connectionPool as DbConnectionPool} from "./Utils/Db";

const {scenarioioName, dto} = JSON.parse(process.argv[2]);

runScenario(scenarioioName, dto)
  .then(console.log)
  .catch(console.error)
  .finally(DbConnectionPool.end);
