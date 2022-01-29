const express = require("express");
const app = express();
const {
  models: { User },
} = require("./db");
app.use(express.json());
module.exports = app;

app.post("/api/auth", async (req, res, next) => {
  try {
    res.send(await User.authenticate(req.body));
  } catch (ex) {
    next(ex);
  }
});
