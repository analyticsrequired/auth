import assert from "assert";
import express from "express";
import expressWinston from "express-winston";
import passport from "passport";
import passportJWT from "passport-jwt";
import cors from "cors";
import UserService from "./services/user";
import logger from "./logger";
import root from "./routes/root";
import register from "./routes/register";
import token from "./routes/token";

assert(process.env.JWT_SECRET, "Environment variable JWT_SECRET not set");

const server = express();

server.use(cors());

// Body

server.use(express.json());
server.use(
  express.urlencoded({
    extended: true
  })
);

// Logger

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
    passportJwtStrategy
  )
);

export async function passportJwtStrategy(payload, next) {
  const userService = new UserService();

  let user = await userService.getById(payload.sub);

  if (user) {
    next(null, { ...payload, user });
  } else {
    next(null, false);
  }
}

server.use(passport.initialize());

// Routes

root(server);
register(server);
token(server);

// Error Handling

server.use(function(err, req, res, next) {
  if (err.code === "permission_denied") {
    res.status(403).end();
  }
});

export default server;
