import assert from "assert";
import express from "express";
import expressWinston from "express-winston";
import passport from "passport";
import passportJWT from "passport-jwt";
import root from "./routes/root";
import auth from "./routes/auth";
import logger from "./logger";

assert(process.env.JWT_SECRET, "Environment variable JWT_SECRET not set");

const server = express();

server.use(express.json());
server.use(
  express.urlencoded({
    extended: true
  })
);

server.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "HTTP {{req.method}} {{req.url}}",
    expressFormat: true,
    colorize: false
  })
);

// Passport

passport.use(
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
      secretOrKey: process.env.JWT_SECRET
    },
    async (payload, next) => {
      const user = await userService.getByUsername(payload.id);
      user ? next(null, user) : next(null, false);
    }
  )
);

server.use(passport.initialize());

// Routes

root(server);
auth(server);

export default server;
