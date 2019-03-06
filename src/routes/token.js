import jwt from "jsonwebtoken";
import UserService from "../services/user";
import logger from "../logger";

export default server => {
  server.post("/token", handler);
};

export const handler = async (req, res) => {
  const userService = new UserService();

  try {
    const user = await userService.getById(req.body.id);

    if (!user) {
      logger.info(`User ${req.body.id} requested token but wasn't found`);
      res.status(401).json({ error: "Invalid username or password" });
      return;
    }

    if (user.password === req.body.password) {
      logger.info(`User ${user.username} is authenticated.`);

      const token = jwt.sign(
        { id: user.id, permissions: user.permissions },
        process.env.JWT_SECRET
      );

      res
        .status(201)
        .set("Content-Type", "plain/text")
        .send(token);

      return;
    }

    logger.info(`User ${user.username} was is not able to be authenticated.`);

    res.status(401).json({ error: "Invalid username or password" });
  } catch (e) {
    res.status(500).json({
      error: "An error occurred during registration. Please resubmit."
    });
  }
};
