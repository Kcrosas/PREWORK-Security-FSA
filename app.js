const express = require("express");
const app = express();
const {
  models: { User },
} = require("./db");
app.use(express.json());
module.exports = app;

const path = require("path");
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/auth", async (req, res, next) => {
  try {
    //This returns a token
    res.send({ token: await User.authenticate(req.body) });
  } catch (ex) {
    next(ex);
  }
});
//Error handling. If status error, cool. Otherwise, it'll be a 500 error, and an object will be sent with an error message
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({ error: err.message });
});

app.get("/api/auth", async (req, res, next) => {
  try {
    //sending a header or called authorization. This gives back a username
    res.send(await User.byToken(req.headers.authorization));
  } catch (ex) {
    next(ex);
  }
});
