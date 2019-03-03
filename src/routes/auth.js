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
      (payload, next) => {
        userService
          .getByUsername(payload.id)
          .then(user => (user ? next(null, user) : next(null, false)));
      }
    )
  );

  server.use(passport.initialize());

  server.get(`/auth/user/:username`, (req, res) => {
    userService
      .getByUsername(req.params.username)
      .then(user => res.json(user))
      .catch(err => res.status(400).send(err));
  });

  server.post("/auth/token", (req, res) => {
    userService
      .getByUsername(req.body.id)
      .then(user => {
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
      })
      .catch(err => res.json({ message: err }));
  });

  server.post("/auth/register", (req, res) => {
    userService
      .register(req.body.id, req.body.password)
      .then(user => res.json(user))
      .catch(err => res.status(400).send(err));
  });
};
