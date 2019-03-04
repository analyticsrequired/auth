import jwt from "jsonwebtoken";
import UserService from "../services/user";
import logger from "../logger";
import passport from "passport";
import expressJwtPermissions from "express-jwt-permissions";

const guard = expressJwtPermissions();

export default server => {
  const userService = new UserService();

  server.post("/token", async (req, res) => {
    try {
      const user = await userService.getByUsername(req.body.id);

      if (!user) {
        logger.info(`User ${req.body.id} requested token but wasn't found`);
        res.status(401).json({ error: "Invalid username or password" });
        return;
      }

      if (user.password === req.body.password) {
        logger.info(`User ${user.username} is authenticated.`);

        const permissions = user.scope.split(" ");

        const token = jwt.sign(
          { id: user.username, permissions },
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
      res.json({ message: e });
    }
  });

  server.post(
    "/invite/:id",
    passport.authenticate("jwt", { session: false }),
    guard.check(["admin"]),
    async (req, res) => {
      const user = await userService.getByUsername(req.params.id);

      if (user) {
        logger.info(`Duplicated user registration: ${req.params.id}`);
        res.status(400).json({ error: "User already exists" });
        return;
      }

      const token = jwt.sign(
        {
          id: req.params.id,
          permissions: ["invitation"],
          inviter: req.user.username
        },
        process.env.JWT_SECRET
      );

      res
        .status(201)
        .set("Content-Type", "plain/text")
        .send(token);
    }
  );

  server.post(
    "/register",
    passport.authenticate("jwt", { session: false }),
    guard.check(["invitation"]),
    async (req, res) => {
      try {
        const { id, inviter } = req.user;
        const { password } = req.body;

        logger.info(`Registration from invite: ${id} invited by ${inviter}`);

        if (!id || !password) {
          res.status(400).json({ error: "Username and password required" });
          return;
        }

        const user = await userService.getByUsername(id);

        if (user) {
          logger.info(`Duplicated user registration: ${id}`);
          res.status(400).json({ error: "User already exists" });
          return;
        }

        await userService.register(id, password);
        res.status(201).end();
      } catch (e) {
        logger.info(
          `Error occured while registering user ${req.body.id}: ${e}`
        );
        res.status(500).json({
          error: "An error occurred during registration. Please resubmit."
        });
      }
    }
  );
};
