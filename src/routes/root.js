export default server => {
  server.get(`/`, handler);
};

export const handler = (_, res) => {
  res.send("Analytics Required Auth Service");
};
