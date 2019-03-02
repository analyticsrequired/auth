import server from "./server";

const port = process.env.NODE_ENV === "production" ? process.env.PORT : 3001;

server.listen(port, () => console.log(`Auth started on port: ${port}!`));
