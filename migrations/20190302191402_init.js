const tableName = "users";

exports.up = knex =>
  knex.schema.createTable(tableName, table => {
    table.increments();
    table.string("username");
    table.string("password");
    table.timestamps(true, true);
  });

exports.down = knex => knex.dropTableIfExists(tableName);
