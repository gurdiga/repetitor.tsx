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

exports.up = function(db) {
  return db.runSql(`
  ALTER TABLE users
  ADD COLUMN email_confirmation_token VARCHAR(16) NOT NULL,
  ADD COLUMN is_email_confirmed BOOLEAN NOT NULL;
  `);
};

exports.down = function(db) {
  return db.runSql(`
  ALTER TABLE users
  DROP COLUMN email_confirmation_token,
  DROP COLUMN is_email_confirmed;
  `);
};

exports._meta = {
  version: 1,
};
