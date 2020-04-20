"use strict";

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.runSql(`
  ALTER TABLE passsword_reset_tokens
  CHANGE COLUMN userId user_id INT NOT NULL;
  `);
};

exports.down = function (db) {
  return db.runSql(`
  ALTER TABLE passsword_reset_tokens
  CHANGE COLUMN user_id userId INT NOT NULL;
  `);
};

exports._meta = {
  version: 1,
};
