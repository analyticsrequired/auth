import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./token";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("token", () => {
  const expectedUserId = "test id";
  const expectedPassword = "test password";
  const expectedPermissions = ["test", "scope"];
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";
  const expectedUser = {
    sub: expectedUserId,
    password: expectedPassword,
    permissions: expectedPermissions
  };

  let req;
  let res;
  let getByIdMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();
    getByIdMock = jest.fn();
    getByIdMock.mockResolvedValue(expectedUser);
    UserService.mockImplementation(() => {
      return {
        getById: getByIdMock
      };
    });

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      body: {
        userId: expectedUserId,
        password: expectedPassword
      }
    };

    res = {
      status: jest.fn(() => res),
      send: jest.fn(() => res),
      json: jest.fn(() => res),
      set: jest.fn(() => res)
    };
  });

  it("should create correct jwt payload", async () => {
    await handler(req, res);

    expect(jwt.sign).toBeCalledWith(
      {
        sub: expectedUserId,
        permissions: expectedPermissions
      },
      expectedJwtSecret,
      {
        expiresIn: "24h"
      }
    );
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.set).toBeCalledWith("Content-Type", "plain/text");
    expect(res.send).toBeCalledWith(expectedToken);
  });

  describe("when invalid credentials", () => {
    beforeEach(() => {
      req.body.password = "incorrect password";
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(401);
      expect(res.json).toBeCalledWith({
        error: "Invalid user id or password"
      });
    });
  });

  describe("when user isn't found", () => {
    beforeEach(() => {
      getByIdMock.mockResolvedValue(false);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(401);
      expect(res.json).toBeCalledWith({
        error: "Invalid user id or password"
      });
    });
  });

  describe("when error is thrown", () => {
    beforeEach(() => {
      getByIdMock.mockImplementation(() => {
        throw new Error();
      });
    });

    it("should return server error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(500);
      expect(res.json).toBeCalledWith({
        error: "An error occurred during authentication. Please resubmit."
      });
    });
  });
});
