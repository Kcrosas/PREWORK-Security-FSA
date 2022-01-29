const {
  models: { User },
  syncAndSeed,
} = require("../db");
const jwt = require("jsonwebtoken");
const { expect } = require("chai");
const { application_name } = require("pg/lib/defaults");
const app = require("supertest")(require("../app"));

describe("Routes", () => {
  let seed;
  beforeEach(async () => (seed = await syncAndSeed()));
  describe("seeded data", () => {
    it("there are 3 users", () => {
      expect(Object.keys(seed.users).length).to.equal(3);
    });
  });
  describe("POST /api/auth", () => {
    describe("with valid credentials", () => {
      it("returns a token", async () => {
        const response = await app
          .post("/api/auth")
          .send({ username: "larry", password: "larry_pw" });
        expect(response.status).to.equal(200);
        //This is used with SuperTest
        expect(response.body.token).to.be.ok;
      });
    });
  });
});
