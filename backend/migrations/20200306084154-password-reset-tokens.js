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
  RENAME TABLE passsword_recovery_tokens TO passsword_reset_tokens;
  `);
};

exports.down = function(db) {
  return db.runSql(`
  RENAME TABLE passsword_reset_tokens TO passsword_recovery_tokens;
  `);
};

exports._meta = {
  version: 1,
};
