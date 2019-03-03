import assert from "assert";
import jwt from "jsonwebtoken";
import passport from "passport";
import passportJWT from "passport-jwt";
import UserService from "../services/user";
import logger from "../logger";

export default server => {
  assert(process.env.JWT_SECRET, "Environment variable JWT_SECRET not set");

  const secret = process.env.JWT_SECRET;
  const userService = new UserService();

  passport.use(
    new passportJWT.Strategy(
      {
        jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        secretOrKey: secret
      },
      async (payload, next) => {
        const user = await userService.getByUsername(payload.id);
        user ? next(null, user) : next(null, false);
      }
    )
  );

  server.use(passport.initialize());

  server.post("/token", async (req, res) => {
    try {
      const user = await userService.getByUsername(req.body.id);

      if (!user) {
        logger.info(`User ${req.body.id} requested token but wasn't found`);

        res.status(401).json({ error: "Invalid username or password" });
      }

      if (user.password === req.body.password) {
        logger.info(`User ${user.username} is authenticated.`);

        const token = jwt.sign({ id: user.username }, secret);

        res
          .status(201)
          .set("Content-Type", "plain/text")
          .send(token);
      }

      logger.info(`User ${user.username} was is not able to be authenticated.`);

      res.status(401).json({ error: "Invalid username or password" });
    } catch (e) {
      res.json({ message: e });
    }
  });

  server.post("/register", async (req, res) => {
    try {
      const { id, password } = req.body;

      if (!id || !password) {
        res.status(400).json({ error: "Username and password required" });
      }

      const user = await userService.getByUsername(id);

      if (user) {
        logger.info(`Duplicated user registration: ${id}`);
        res.status(401).json({ error: "User already exists" });
        return;
      }

      await userService.register(id, password);
      res.status(201).end();
    } catch (e) {
      logger.info(`Error occured while registering user ${id}: ${e}`);
      res.status(500).json({
        error: "An error occurred during registration. Please resubmit."
      });
    }
  });
};
