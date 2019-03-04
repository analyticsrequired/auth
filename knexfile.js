const assert = require("assert");

const { PG_USER, PG_PASSWORD, DATABASE_URL } = process.env;

if (process.env.NODE_ENV === "local") {
  assert(PG_USER, "Environment variable PG_USER not set");
  assert(PG_PASSWORD, "Environment variable PG_PASSWORD not set");
}

const schemaName = "ar_auth";

module.exports = {
  local: {
    client: "pg",
    connection: {
      host: "localhost",
      user: PG_USER,
      password: PG_PASSWORD
    },
    migrations: {
      schemaName
    }
  },
  production: {
    client: "pg",
    connection: DATABASE_URL,
    migrations: {
      schemaName
    }
  }
};
