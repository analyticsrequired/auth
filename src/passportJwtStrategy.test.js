import passportJwtStrategy from "./passportJwtStrategy";
import { mockUserService } from "./setupJest";
import UserService from "./services/user";

jest.mock("./services/user");

describe("passportJwtStrategy", () => {
  let expectedPayload;
  let nextMock;
  let userServiceMock;
  let expectedDbUser;

  beforeEach(() => {
    expectedPayload = {};
    nextMock = jest.fn();
    expectedDbUser = {};
    userServiceMock = mockUserService(UserService);

    process.env.JWT_REFRESH_SECRET = "";
  });

  describe("when user is found", () => {
    beforeEach(() => {
      userServiceMock.getById.mockResolvedValue(expectedDbUser);
    });

    it("should pass jwt payload and user", async () => {
      await passportJwtStrategy(expectedPayload, nextMock);

      expect(nextMock).toBeCalledWith(null, {
        ...expectedPayload,
        user: expectedDbUser
      });
    });
  });

  describe("when user is not found", () => {
    beforeEach(() => {
      userServiceMock.getById.mockResolvedValue(false);
    });

    it("should pass jwt payload and user", async () => {
      await passportJwtStrategy(expectedPayload, nextMock);

      expect(nextMock).toBeCalledWith(null, false);
    });
  });
});
