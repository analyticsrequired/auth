const tableName = "users";

exports.up = knex =>
  knex.schema.createTable(tableName, table => {
    table.increments();
    table
      .string("username")
      .unique()
      .notNullable();
    table.string("password").notNullable();
    table.string("scope").defaultTo("");
    table.timestamps(true, true);
  });

exports.down = knex => knex.dropTableIfExists(tableName);
