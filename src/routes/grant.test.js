import UserService from "../services/user";
import { handler } from "./grant";
import { mockResponse, mockUserService } from "../setupJest";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("grant", () => {
  const expectedUserId = "expected user id";
  const expectedPermissions = ["full", "list", "of", "permissions"];
  const expectedJwtSecret = "expected jwt secret";

  let req;
  let res;
  let userServiceMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();
    userServiceMock = mockUserService(UserService);
    userServiceMock.getById.mockResolvedValue(false);

    req = {
      body: {
        userId: expectedUserId,
        permissions: expectedPermissions
      }
    };

    res = mockResponse();
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
  });

  it("should update the database", async () => {
    await handler(req, res);

    expect(userServiceMock.grant).toBeCalledWith(
      expectedUserId,
      expectedPermissions
    );
  });

  describe("when user id is missing", () => {
    beforeEach(() => {
      delete req.body.userId;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "User Id required"
      });
    });
  });

  describe("when permissions is missing", () => {
    beforeEach(() => {
      delete req.body.permissions;
    });

    it("should return validation error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({
        error: "Permissions required"
      });
    });
  });

  describe("when error is thrown", () => {
    it("should return server error to user", async () => {
      userServiceMock.grant.mockImplementation(() => {
        throw new Error();
      });

      await handler(req, res);

      expect(res.status).toBeCalledWith(500);
      expect(res.json).toBeCalledWith({
        error: "An error occurred."
      });
    });
  });
});
