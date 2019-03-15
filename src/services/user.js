import db from "../db";

const tableName = "users";

export default class UserService {
  async getById(userId) {
    const user = await db(tableName)
      .first()
      .where({ userId });

    if (user) {
      user.permissions = user.scope.length === 0 ? [] : user.scope.split(" ");
      delete user.scope;
    }

    return user;
  }

  register(userId, password) {
    return db(tableName).insert({
      userId,
      password
    });
  }
}
