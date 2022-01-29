//token dependecies
const jwt = require("jsonwebtoken");
//bcrypt for hashing passwords
const bcrypt = require("bcrypt");

const Sequelize = require("sequelize");
const { STRING } = Sequelize;
//used because we are not looking at SQL as much, we don't need to see logs
//Running 'npm run test' won't show the SQL actions
const config = {
  logging: false,
};
//If I want to see the logging, I can call this
//Can be called by doing 'LOGGING=true npm run test'
if (process.env.LOGGING) {
  delete config.logging;
}
const conn = new Sequelize(
  process.env.DATABASE_URL || "postgres://localhost/acme_db",
  config
);
const User = conn.define("user", {
  username: STRING,
  password: STRING,
});

User.addHook("beforeSave", async function (user) {
  //shows properties being changed
  //console.log(user._changed);

  //If password was not changed, don't rehash password
  if (user._changed.has("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
});

User.authenticate = async ({ username, password }) => {
  const user = await User.findOne({
    where: { username },
  });
  //if user exist and the comparison is true between password and user.pasword
  if (user && (await bcrypt.compare(password, user.password))) {
    //Temporary secret for testing purposes
    return jwt.sign({ id: user.id }, process.env.JWT);
  }
  //if user does not exist, throw error
  const error = Error("bad credentials");
  error.status = 401;
  throw error;
};

User.byToken = async (token) => {
  //happy path
  try {
    //this verifies if it's a valid token
    const { id } = await jwt.verify(token, process.env.JWT);
    const user = await User.findByPk(id);
    //checks to see if user exist
    if (user) {
      return user;
    }
    //if user does not exist then although the token format is correct, it belongs to no user therefor the system should throw an error
    const error = Error("bad credentials");
    error.status = 401;
    throw error;
    //go to catch if token is invalid
  } catch (ex) {
    const error = Error("bad token");
    error.status = 401;
    throw error;
  }
};
const syncAndSeed = async () => {
  await conn.sync({ force: true });
  const credentials = [
    { username: "lucy", password: "lucy_pw" },
    { username: "larry", password: "larry_pw" },
    { username: "moe", password: "moe_pw" },
  ];
  const [lucy, larry, moe] = await Promise.all(
    credentials.map((credential) => User.create(credential))
  );
  return {
    users: {
      lucy,
      larry,
      moe,
    },
  };
};

module.exports = {
  syncAndSeed,
  models: {
    User,
  },
};
