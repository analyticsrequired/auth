import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";
import UserService from "../services/user";
import logger from "../logger";

const guard = expressJwtPermissions();

export default server => {
  server.get(
    "/user/:userId",
    passport.authenticate("jwt", { session: false }),
    guard.check("admin"),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();

  const { userId } = req.params;

  let user;

  try {
    user = await userService.getById(userId);
  } catch (e) {
    res.status(500).json({
      error: "An error occurred."
    });

    return;
  }

  if (!user) {
    logger.info(`User ${userId} not found`);
    res.status(404).json({ error: "Unknown user" });
    return;
  }

  delete user.password;

  res
    .status(200)
    .set("Content-Type", "application/json")
    .json(user);
};
