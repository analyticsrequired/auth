import db from "../db";

const tableName = "users";

export default class UserService {
  getByUsername(username) {
    return db(tableName)
      .first()
      .where({ username });
  }

  register(username, password) {
    return db(tableName).insert({ username, password });
  }
}
