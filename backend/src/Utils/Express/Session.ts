import * as expressSession from "express-session";
import {connectionPool} from "Utils/Db";
import {requireEnvVar} from "Utils/Env";

const MySQLSessionStore = require("express-mysql-session")(expressSession);
const sessionStore = new MySQLSessionStore({}, connectionPool);

export const session = expressSession({
  secret: requireEnvVar("SESSION_COOKIE_SECRET"),
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: true,
    maxAge: 1000 * 3600 * 24 * 7,
  },
});
