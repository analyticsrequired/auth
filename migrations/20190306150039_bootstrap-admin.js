const jwt = require("jsonwebtoken");

exports.up = async function() {
  const token = jwt.sign(
    {
      id: "admin",
      permissions: ["invitation"],
      inviter: null,
      grant: ["admin"]
    },
    process.env.JWT_SECRET
  );

  console.log(`Bootstrap Invite:\n\n${token}\n\n`);
};

exports.down = async function() {};
