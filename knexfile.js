module.exports = {
  local: {
    client: "sqlite3",
    connection: {
      filename: "./local.sqlite3"
    }
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL
  }
};
