const {
  models: { User },
  syncAndSeed,
} = require("../db");
const jwt = require("jsonwebtoken");
const { expect } = require("chai");

describe("Models", () => {
  let seed;
  beforeEach(async () => (seed = await syncAndSeed()));
  describe("seeded data", () => {
    it("there are 3 users", () => {
      expect(Object.keys(seed.users).length).to.equal(3);
    });
  });
  describe("User update", () => {
    describe("change username", () => {
      it("does not change the password", async () => {
        const password = seed.users.lucy.password;
        const lucy = seed.users.lucy;
        lucy.username = "Looooooo";
        await lucy.save();
        expect(lucy.password).to.equal(password);
      });
    });
  });
  //'Happy path' This test that when a user attempts to authenticate, he receives a token
  describe("User.authenticate", () => {
    describe("correct credentials", () => {
      it("returns a token", async () => {
        const token = await User.authenticate({
          username: "moe",
          password: "moe_pw",
        });
        //Runs an expectation. If not okay, you get an error (if you get something that isn't truthy)
        expect(token).to.be.ok;
        //Viewing token
        console.log(token);
      });
    });
    describe("incorrect credentials", () => {
      it("throws an error", async () => {
        try {
          await User.authenticate({
            //this user does not exist and should cause an error
            username: "moe1",
            password: "moe_pw",
          });
          //throw "NOOO";
        } catch (error) {
          expect(error.status).to.equal(401);
          expect(error.message).to.equal("bad credentials");
        }
      });
    });
    //testing for valid token
    describe("User.byToken", () => {
      describe("with valid token", () => {
        it("returns a user", async () => {
          const token = await jwt.sign(
            { id: seed.users.larry.id },
            process.env.JWT
          );
          const user = await User.byToken(token);
          expect(user.username).to.equal("larry");
        });
      });
    });
    //testing for invalid token
    describe("with an invalid token", () => {
      it("throws a 401", async () => {
        try {
          const token = await jwt.sign(
            { id: seed.users.larry.id },
            "whjatveac"
          );
          await User.byToken(token);
          throw "invalid token!";
        } catch (error) {
          expect(error.status).to.equal(401);
          expect(error.message).to.equal("bad token");
        }
      });
    });
    describe("with valid token but no associated user", () => {
      it("throws a 401", async () => {
        try {
          const token = await jwt.sign({ id: 99 }, process.env.JWT);
          await User.byToken(token);
          throw "invalid token!";
        } catch (error) {
          expect(error.status).to.equal(401);
          expect(error.message).to.equal("bad token");
        }
      });
    });
  });
});
