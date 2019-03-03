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

  server.post("/auth/token", async (req, res) => {
    try {
      const user = await userService.getByUsername(req.body.id);

      if (!user) {
        logger.info(`User ${req.body.id} not found`);
        res.status(401).json({ message: "Invalid username or password" });
      }

      if (user.password === req.body.password) {
        logger.info(`User ${user.username} is authenticated.`);
        const message = "ok";
        const token = jwt.sign({ id: user.username }, secret);
        res.json({ message, token });
      } else {
        logger.info(`User ${user.username} is not authenticated.`);
        const message = "Invalid username or password";
        res.status(401).json({ message });
      }
    } catch (e) {
      res.json({ message: e });
    }
  });

  server.post("/auth/register", async (req, res) => {
    try {
      const user = await userService.register(req.body.id, req.body.password);
      res.json(user);
    } catch (e) {
      res.status(400).send(e);
    }
  });
};
