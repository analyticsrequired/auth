import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";
import UserService from "../services/user";
import logger from "../logger";

// TODO: Logging

const guard = expressJwtPermissions();

export default server => {
  server.post(
    "/grant",
    passport.authenticate("jwt", { session: false }),
    guard.check("admin"),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();

  const { userId, permissions } = req.body;

  if (!userId) {
    res.status(400).json({
      error: "User Id required"
    });
  }

  if (!permissions) {
    res.status(400).json({
      error: "Permissions required"
    });
  }

  try {
    await userService.grant(userId, permissions);
    res.status(201).end();
  } catch (e) {
    res.status(500).json({
      error: "An error occurred."
    });
  }
};
