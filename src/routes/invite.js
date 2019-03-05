import jwt from "jsonwebtoken";
import UserService from "../services/user";
import logger from "../logger";
import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";

export default server => {
  const guard = expressJwtPermissions();

  server.post(
    "/invite/:username",
    passport.authenticate("jwt", { session: false }),
    guard.check(["admin"]),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();
  const { username } = req.params;
  const { username: inviter } = req.user;

  const user = await userService.getByUsername(username);

  if (user) {
    logger.info(`Duplicated user registration: ${username}`);
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const token = jwt.sign(
    {
      id: username,
      permissions: ["invitation"],
      inviter
    },
    process.env.JWT_SECRET
  );

  debugger;

  res
    .status(201)
    .set("Content-Type", "plain/text")
    .send(token);
};
