"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db, callback) {
  const sql = `
  ALTER TABLE users
  ADD password_salt VARCHAR(100) NOT NULL;
  `;

  db.runSql(sql, call(callback));
};

exports.down = function(db, callback) {
  const sql = `
  ALTER TABLE users
  DROP password_salt;
  `;

  db.runSql(sql, call(callback));
};

function call(callback) {
  return function(err) {
    if (err) return console.error(err);
    callback();
  };
}

exports._meta = {
  version: 1,
};
