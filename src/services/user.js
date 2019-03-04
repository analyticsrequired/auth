import db from "../db";

const tableName = "users";

export default class UserService {
  async getByUsername(username) {
    const user = await db(tableName)
      .first()
      .where({ username });

    user.permissions = user.scope.split(" ");

    return user;
  }

  register(username, password) {
    return db(tableName).insert({ username, password });
  }
}
