const app = require("./app");
const { syncAndSeed } = require("./db");

const init = async () => {
  await syncAndSeed();
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`listening on ${port}`));
};

init();
