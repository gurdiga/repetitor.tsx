import {connectionPool} from "backend/src/Db";
import {requireEnvVar} from "backend/src/Env";
import * as expressSession from "express-session";

const MySQLSessionStore = require("express-mysql-session")(expressSession);
const sessionStore = new MySQLSessionStore({}, connectionPool);

const MAX_AGE = 7 * 24 * 3600 * 1000;

export const session = expressSession({
  secret: requireEnvVar("APP_SESSION_COOKIE_SECRET"),
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: MAX_AGE,
  },
});
