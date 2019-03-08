import UserService from "../services/user";
import logger from "../logger";
import passport from "passport";

export default server => {
  server.post(
    "/register",
    passport.authenticate("jwt", { session: false }),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();

  try {
    const { sub, invitation } = req.user;
    const { password } = req.body;

    if (!invitation) {
      logger.info(`Unauthorized invitation: ${JSON.stringify(req.user)}`);
      res.status(401).end();
      return;
    }

    const { inviter, grant } = invitation;

    logger.info(`Registration from invite: ${sub} invited by ${inviter}`);

    if (!sub || !password) {
      res.status(400).json({ error: "Id and password required" });
      return;
    }

    const user = await userService.getById(sub);

    if (user) {
      logger.info(`Duplicated user registration: ${sub}`);
      res.status(400).json({ error: "User already exists" });
      return;
    }

    await userService.register(sub, password, grant);
    res.status(201).end();
  } catch (e) {
    logger.info(`Error occured while registering user ${req.body.id}: ${e}`);
    res.status(500).json({
      error: "An error occurred during registration. Please resubmit."
    });
  }
};
