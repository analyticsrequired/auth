import jwt from "jsonwebtoken";
import UserService from "../services/user";
import logger from "../logger";
import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";

export default server => {
  const guard = expressJwtPermissions();

  server.post(
    "/invite/:userId",
    passport.authenticate("jwt", { session: false }),
    guard.check(["admin"]),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();
  const { userId } = req.params;
  const { grant = [] } = req.body;
  const { sub: inviter } = req.user;

  const user = await userService.getById(userId);

  if (user) {
    logger.info(`Duplicated user registration: ${userId}`);
    res.status(400).json({ error: "User already exists" });
    return;
  }

  const token = jwt.sign(
    {
      sub: userId,
      permissions: [],
      invitation: {
        grant,
        inviter
      }
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  res
    .status(201)
    .set("Content-Type", "plain/text")
    .send(token);
};
