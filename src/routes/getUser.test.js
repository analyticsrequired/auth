import UserService from "../services/user";
import { handler } from "./getUser";
import { mockResponse, mockUserService } from "../setupJest";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("getUser", () => {
  const expectedUserId = "test id";
  const expectedPassword = "test password";
  const expectedPermissions = ["test", "scope"];
  const expectedUser = {
    userId: expectedUserId,
    password: expectedPassword,
    permissions: expectedPermissions
  };

  let req;
  let res;
  let userServiceMock;

  beforeEach(() => {
    UserService.mockClear();
    userServiceMock = mockUserService(UserService);
    userServiceMock.getById.mockResolvedValue(expectedUser);

    req = {
      params: {
        userId: expectedUserId
      }
    };

    res = mockResponse();
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(200);
    expect(res.set).toBeCalledWith("Content-Type", "application/json");
    expect(res.json).toBeCalledWith(expectedUser);
  });

  describe("when user isn't found", () => {
    beforeEach(() => {
      userServiceMock.getById.mockResolvedValue(false);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(404);
      expect(res.json).toBeCalledWith({
        error: "Unknown user"
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
        error: "An error occurred."
      });
    });
  });
});
