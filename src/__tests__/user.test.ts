import supertest from "supertest";
import { app } from "../setup-app";
import { User } from "../models/user";
import * as userController from "../controllers/user";
import { HttpStatusCode } from "../utilities/http-status-codes";
import { Password } from "../services/password";
import { inputSigningUpUserData, inputSigningInUserData } from "./mock-data/user";

describe("Route: /signup", () => {
  it("successfully signs up a user", async () => {
    // @ts-ignore
    jest.spyOn(User, "create").mockReturnValue(new User(inputSigningUpUserData));
    // @ts-ignore
    jest.spyOn(userController, "isEmailTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isBattleTagTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isDiscordTagTaken").mockReturnValue(false);

    const { statusCode, body } = await supertest(app).post(`/api/user/auth/signUp`).send(inputSigningUpUserData);

    expect(statusCode).toBe(HttpStatusCode.CREATED_201);
    expect(body.jwt).toBeDefined();
    expect(body.user).toBeDefined();
  });

  it(`throws an error, if "email" is taken`, async () => {
    // @ts-ignore
    jest.spyOn(User, "create").mockReturnValue(new User(inputSigningUpUserData));
    // @ts-ignore
    jest.spyOn(userController, "isEmailTaken").mockReturnValue(true);
    // @ts-ignore
    jest.spyOn(userController, "isBattleTagTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isDiscordTagTaken").mockReturnValue(false);

    const { statusCode } = await supertest(app).post(`/api/user/auth/signUp`).send(inputSigningUpUserData);

    expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST_400);
  });

  it(`throws an error, if "battle tag" is taken`, async () => {
    // @ts-ignore
    jest.spyOn(User, "create").mockReturnValue(new User(inputSigningUpUserData));
    // @ts-ignore
    jest.spyOn(userController, "isEmailTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isBattleTagTaken").mockReturnValue(true);
    // @ts-ignore
    jest.spyOn(userController, "isDiscordTagTaken").mockReturnValue(false);

    const { statusCode } = await supertest(app).post(`/api/user/auth/signUp`).send(inputSigningUpUserData);

    expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST_400);
  });

  it(`throws an error, if "discord tag" is taken`, async () => {
    // @ts-ignore
    jest.spyOn(User, "create").mockReturnValue(new User(inputSigningUpUserData));
    // @ts-ignore
    jest.spyOn(userController, "isEmailTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isBattleTagTaken").mockReturnValue(false);
    // @ts-ignore
    jest.spyOn(userController, "isDiscordTagTaken").mockReturnValue(true);

    const { statusCode } = await supertest(app).post(`/api/user/auth/signUp`).send(inputSigningUpUserData);

    expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST_400);
  });
});

describe("Route: /signin", () => {
  it("successfully signs in a user", async () => {
    const user = new User({ ...inputSigningInUserData, password: await Password.encrypt(inputSigningInUserData.password) });
    // @ts-ignore
    jest.spyOn(User, "findOne").mockReturnValue(user);

    const { statusCode, body } = await supertest(app).post(`/api/user/auth/signIn`).send(inputSigningInUserData);

    expect(statusCode).toBe(HttpStatusCode.OK_200);
    expect(body.jwt).toBeDefined();
    expect(body.user).toBeDefined();
  });

  it("throws an error, if user enters invalid email", async () => {
    // @ts-ignore
    jest.spyOn(User, "findOne").mockReturnValue(null);

    const { statusCode } = await supertest(app).post(`/api/user/auth/signIn`).send(inputSigningInUserData);

    expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST_400);
  });

  it("throws an error, if user enters invalid password", async () => {
    const user = new User({ ...inputSigningInUserData, password: await Password.encrypt(inputSigningInUserData.password) });
    // @ts-ignore
    jest.spyOn(User, "findOne").mockReturnValue(user);

    const { statusCode } = await supertest(app).post(`/api/user/auth/signIn`).send({ email: inputSigningInUserData.email, password: "INVALID_PASSWORD" });

    expect(statusCode).toBe(HttpStatusCode.BAD_REQUEST_400);
  });
});
