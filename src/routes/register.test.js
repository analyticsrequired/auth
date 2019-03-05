import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./register";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("register", () => {
  const expectedUsername = "test username";
  const expectedInviterUsername = "test inviter username";
  const expectedPassword = "expected password";
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";

  let req;
  let res;
  let getByUsernameMock;
  let registerMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();

    getByUsernameMock = jest.fn();
    getByUsernameMock.mockResolvedValue(false);

    registerMock = jest.fn();

    UserService.mockImplementation(() => {
      return {
        getByUsername: getByUsernameMock,
        register: registerMock
      };
    });

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      body: {
        password: expectedPassword
      },
      user: {
        id: expectedUsername,
        inviter: expectedInviterUsername
      }
    };

    res = {
      send: jest.fn(() => res),
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      set: jest.fn(() => res),
      end: jest.fn(() => res)
    };
  });

  describe("when grant defined", () => {
    beforeEach(() => {
      req.user.grant = ["granted"];
    });

    it("should call register with", async () => {
      await handler(req, res);

      expect(registerMock).toBeCalledWith(
        req.user.id,
        req.body.password,
        req.user.grant
      );
    });
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
  });

  describe("when username is missing", () => {
    beforeEach(() => {
      delete req.user.id;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "Username and password required"
      });
    });
  });

  describe("when password is missing", () => {
    beforeEach(() => {
      delete req.body.password;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "Username and password required"
      });
    });
  });

  describe("when user already registered", () => {
    beforeEach(() => {
      getByUsernameMock.mockResolvedValue(true);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({ error: "User already exists" });
    });
  });

  describe("when error is thrown", () => {
    it("should return server error to user", async () => {
      registerMock.mockImplementation(() => {
        throw new Error();
      });

      await handler(req, res);

      expect(res.status).toBeCalledWith(500);
      expect(res.json).toBeCalledWith({
        error: "An error occurred during registration. Please resubmit."
      });
    });
  });
});
