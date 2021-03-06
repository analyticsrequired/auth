import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./register";
import { mockResponse, mockUserService } from "../setupJest";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("register", () => {
  const expectedUserId = "expected user id";
  const expectedPassword = "expected password";
  const expectedToken = "expected token";
  const expectedJwtSecret = "expected jwt secret";

  let req;
  let res;
  let userServiceMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();
    userServiceMock = mockUserService(UserService);
    userServiceMock.getById.mockResolvedValue(false);

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      body: {
        userId: expectedUserId,
        password: expectedPassword
      }
    };

    res = mockResponse();
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
  });

  describe("when user id is missing", () => {
    beforeEach(() => {
      delete req.body.userId;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "User Id and Password required"
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
        error: "User Id and Password required"
      });
    });
  });

  describe("when user already registered", () => {
    beforeEach(() => {
      userServiceMock.getById.mockResolvedValue(true);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({ error: "User already exists" });
    });
  });

  describe("when error is thrown", () => {
    it("should return server error to user", async () => {
      userServiceMock.getById.mockImplementation(() => {
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
