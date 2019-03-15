const tableName = "users";

exports.up = knex =>
  knex.schema.alterTable(tableName, table => {
    table.renameColumn("username", "userId");
  });

exports.down = knex =>
  knex.schema.alterTable(tableName, table => {
    table.renameColumn("userId", "username");
  });
