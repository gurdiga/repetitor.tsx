import {runScenario} from "backend/src/Utils/ScenarioRunner";
import {connectionPool as DbConnectionPool} from "backend/src/Utils/Db";

const {scenarioioName, scenarioInput} = JSON.parse(process.argv[2]);

runScenario(scenarioioName, scenarioInput)
  .then(console.log)
  .catch(console.error)
  .finally(DbConnectionPool.end);
