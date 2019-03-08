import db from "../db";

const tableName = "users";

export default class UserService {
  async getById(id) {
    const user = await db(tableName)
      .first()
      .where({ username: id });

    if (user) {
      user.permissions = user.scope.length === 0 ? [] : user.scope.split(" ");
      delete user.scope;

      user.sub = user.username;
      delete user.username;
    }

    return user;
  }

  register(id, password, grant = []) {
    return db(tableName).insert({
      username: id,
      password,
      scope: grant.length ? grant.join(" ") : ""
    });
  }
}
