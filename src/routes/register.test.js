import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./register";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("register", () => {
  const expectedUserId = "test id";
  const expectedInviterId = "test inviter id";
  const expectedPassword = "expected password";
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";

  let req;
  let res;
  let getByIdMock;
  let registerMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();

    getByIdMock = jest.fn();
    getByIdMock.mockResolvedValue(false);

    registerMock = jest.fn();

    UserService.mockImplementation(() => {
      return {
        getById: getByIdMock,
        register: registerMock
      };
    });

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      body: {
        password: expectedPassword
      },
      user: {
        id: expectedUserId,
        inviter: expectedInviterId
      }
    };

    res = {
      status: jest.fn(() => res),
      send: jest.fn(() => res),
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
        expectedUserId,
        expectedPassword,
        req.user.grant
      );
    });
  });

  it("should return correct response", async () => {
    await handler(req, res);

    debugger;

    expect(res.status).toBeCalledWith(201);
  });

  describe("when id is missing", () => {
    beforeEach(() => {
      delete req.user.id;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "Id and password required"
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
        error: "Id and password required"
      });
    });
  });

  describe("when user already registered", () => {
    beforeEach(() => {
      getByIdMock.mockResolvedValue(true);
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
