import assert from "assert";
import express from "express";
import expressWinston from "express-winston";
import passport from "passport";
import passportJWT from "passport-jwt";
import cors from "cors";
import logger from "./logger";
import root from "./routes/root";
import register from "./routes/register";
import token from "./routes/token";
import refresh from "./routes/refresh";
import grant from "./routes/grant";
import getUser from "./routes/getUser";
import passportJwtStrategy from "./passportJwtStrategy";

assert(process.env.JWT_SECRET, "Environment variable JWT_SECRET not set");
assert(
  process.env.JWT_REFRESH_SECRET,
  "Environment variable JWT_REFRESH_SECRET not set"
);

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

passport.use(
  "jwt-refresh-token",
  new passportJWT.Strategy(
    {
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderWithScheme("jwt"),
      secretOrKey: process.env.JWT_REFRESH_SECRET
    },
    passportJwtStrategy
  )
);

server.use(passport.initialize());

// Routes

root(server);
register(server);
token(server);
refresh(server);
grant(server);
getUser(server);

// Error Handling

server.use(function(err, req, res, next) {
  if (err.code === "permission_denied") {
    res.status(403).end();
  }
});

export default server;
