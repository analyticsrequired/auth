import jwt from "jsonwebtoken";
import passport from "passport";
import UserService from "../services/user";
import logger from "../logger";

export default server => {
  server.post(
    "/refresh",
    passport.authenticate("jwt-refresh-token", { session: false }),
    handler
  );
};

export const handler = async (req, res) => {
  const userService = new UserService();

  const { sub } = req.user;

  let user;

  try {
    user = await userService.getById(sub);
  } catch (e) {
    res.status(500).json({
      error: "An error occurred during authentication. Please resubmit."
    });

    return;
  }

  if (!user) {
    logger.info(`User ${sub} requested token but wasn't found`);
    res.status(401).json({ error: "Invalid user id or password" });
    return;
  }

  const { permissions } = user;

  const token = jwt.sign({ sub, permissions }, process.env.JWT_SECRET, {
    expiresIn: "30m"
  });

  res
    .status(201)
    .set("Content-Type", "plain/text")
    .send(token);
};
