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
  CREATE TABLE email_change_requests (
    user_id INT NOT NULL UNIQUE,
    current_email VARCHAR(50) NOT NULL,
    new_email VARCHAR(50) NOT NULL,
    token VARCHAR(16) UNIQUE NOT NULL
  );
  `);
};

exports.down = function (db) {
  return db.runSql(`
  DROP TABLE email_change_requests;
  `);
};

exports._meta = {
  version: 1,
};
