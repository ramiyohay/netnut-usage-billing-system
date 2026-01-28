import request from "supertest";
import { app } from "../src/app";

test("health (via products)", async () => {
  const res = await request(app).get("/products");

  expect(res.status).toBe(200);
});
