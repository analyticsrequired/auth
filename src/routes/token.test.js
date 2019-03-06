import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./token";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("token", () => {
  const expectedUsername = "test username";
  const expectedPassword = "test password";
  const expectedPermissions = ["test", "scope"];
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";
  const expectedUser = {
    id: expectedUsername,
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
        id: expectedUsername,
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
        id: expectedUsername,
        permissions: expectedPermissions
      },
      expectedJwtSecret
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
        error: "Invalid username or password"
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
        error: "Invalid username or password"
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
        error: "An error occurred during registration. Please resubmit."
      });
    });
  });
});
