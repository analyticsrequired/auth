import UserService from "../services/user";
import logger from "../logger";

export default server => {
  server.post("/register", handler);
};

export const handler = async (req, res) => {
  const userService = new UserService();

  const { userId, password } = req.body;

  try {
    if (!userId || !password) {
      res.status(400).json({ error: "User Id and Password required" });
      return;
    }

    const user = await userService.getById(userId);

    if (user) {
      logger.info(`Duplicated user registration: ${userId}`);
      res.status(400).json({ error: "User already exists" });
      return;
    }

    await userService.register(userId, password);
    res.status(201).end();
  } catch (e) {
    logger.info(`Error occured while registering user ${userId}: ${e}`);
    res.status(500).json({
      error: "An error occurred during registration. Please resubmit."
    });
  }
};
