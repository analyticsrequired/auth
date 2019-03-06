import UserService from "../services/user";
import logger from "../logger";
import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";

export default server => {
  const guard = expressJwtPermissions();

  server.post(
    "/register",
    passport.authenticate("jwt", { session: false }),
    guard.check(["invitation"]),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();

  try {
    const { id, inviter, grant } = req.user;
    const { password } = req.body;

    logger.info(`Registration from invite: ${id} invited by ${inviter}`);

    if (!id || !password) {
      res.status(400).json({ error: "Id and password required" });
      return;
    }

    const user = await userService.getById(id);

    if (user) {
      logger.info(`Duplicated user registration: ${id}`);
      res.status(400).json({ error: "User already exists" });
      return;
    }

    await userService.register(id, password, grant);
    res.status(201).end();
  } catch (e) {
    logger.info(`Error occured while registering user ${req.body.id}: ${e}`);
    res.status(500).json({
      error: "An error occurred during registration. Please resubmit."
    });
  }
};
