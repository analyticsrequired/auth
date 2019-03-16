import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./refresh";
import { mockResponse, mockUserService } from "../setupJest";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("refresh", () => {
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
  let userServiceMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();
    userServiceMock = mockUserService(UserService);
    userServiceMock.getById.mockResolvedValue(expectedUser);

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      user: {
        sub: expectedUserId
      }
    };

    res = mockResponse();
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
        expiresIn: "30m"
      }
    );
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.set).toBeCalledWith("Content-Type", "plain/text");
    expect(res.send).toBeCalledWith(expectedToken);
  });

  describe("when user isn't found", () => {
    beforeEach(() => {
      userServiceMock.getById.mockResolvedValue(false);
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
      userServiceMock.getById.mockImplementation(() => {
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
