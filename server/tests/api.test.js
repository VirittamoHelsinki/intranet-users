import mongoose from "mongoose";
import supertest from "supertest";

import app from "../index.js";
const api = supertest(app);

import User from "../models/user.js";

import { manyUsers } from "./test_data.js";

beforeEach(async () => {
  await User.deleteMany({});

  // This is not currently working. Fix it! (bcrypt function does not seem to work)
  // Yet it does not throw an error or it is not showed for some reason
  await manyUsers.forEach(async (user) => {
    await api.post("/api/users").send(user);
  });
});

describe("/authorize router tests", () => {
  test("post /api/authenticate returns 200 with valid email and password", async () => {
    console.log("manyUsers[0]:", manyUsers[0]);
    const response = await api
      .post("/api/authenticate")
      .send(manyUsers[0])
      .expect(200);
    console.log(response.data);
  });

  test("logout to blacklist a token", async () => {
    const response = await api
      .post("/api/authenticate")
      .send(manyUsers[1])
      .expect(200);
    console.log("response.data:", response.data);
    const { token } = response.data;
    await api
      .post("/api/authorize/logout")
      .set("Authorization", `bearer ${token}`)
      .expect(200);

    await api
      .get("/api/authorize")
      .set("Authorization", `bearer ${token}`)
      .expect(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
