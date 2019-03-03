import express from "express";
import expressWinston from "express-winston";
import root from "./routes/root";
import auth from "./routes/auth";
import logger from "./logger";

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

// Routes

root(server);
auth(server);

export default server;
