import UserService from "./services/user";

export default async function passportJwtStrategy(payload, next) {
  const userService = new UserService();
  let user = await userService.getById(payload.sub);
  if (user) {
    next(null, { ...payload, user });
  } else {
    next(null, false);
  }
}
