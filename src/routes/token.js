import jwt from "jsonwebtoken";
import UserService from "../services/user";
import logger from "../logger";

export default server => {
  server.post("/token", handler);
};

export const handler = async (req, res) => {
  const userService = new UserService();

  const { userId, password } = req.body;

  try {
    const user = await userService.getById(userId);

    if (!user) {
      logger.info(`User ${userId} requested token but wasn't found`);
      res.status(401).json({ error: "Invalid user id or password" });
      return;
    }

    if (user.password === password) {
      logger.info(
        `User ${user.sub} is authenticated with permissions: ${JSON.stringify(
          user.permissions
        )}`
      );

      const token = jwt.sign(
        { sub: userId, permissions: user.permissions },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h"
        }
      );

      res
        .status(201)
        .set("Content-Type", "plain/text")
        .send(token);

      return;
    }

    logger.info(`User ${userId} was is not able to be authenticated.`);

    res.status(401).json({ error: "Invalid user id or password" });
  } catch (e) {
    res.status(500).json({
      error: "An error occurred during authentication. Please resubmit."
    });
  }
};
