import UserService from "./user";
import db from "../db";

jest.mock("../db");

describe("UserService", () => {
  const expectedUserId = "expected id";
  const expectedPassword = "expected password";

  let userService;
  let instanceMock;
  let insertMock;
  let firstMock;
  let whereMock;
  let expectedUser;

  beforeEach(() => {
    expectedUser = {
      scope: "foo bar",
      userId: expectedUserId
    };

    insertMock = jest.fn(() => instanceMock);
    firstMock = jest.fn(() => instanceMock);
    whereMock = jest.fn().mockResolvedValue(expectedUser);

    instanceMock = {
      insert: insertMock,
      first: firstMock,
      where: whereMock
    };

    db.mockImplementation(() => {
      return instanceMock;
    });

    userService = new UserService();
  });

  describe("getById", () => {
    it("should return user", async () => {
      const user = await userService.getById(expectedUserId);
      expect(user).toEqual(expectedUser);
    });

    it.skip("should call where with correct params", async () => {
      await userService.getById(expectedUserId);
      expect(whereMock).toBeCalledWith({ username: expectedUserId });
    });

    it("should map permissions", async () => {
      const user = await userService.getById(expectedUserId);
      expect(user.permissions).toEqual(["foo", "bar"]);
    });

    it("should remove scope", async () => {
      const user = await userService.getById(expectedUserId);
      expect(user.scope).toBeUndefined();
    });
  });

  describe("register", () => {
    it("should call insert correctly", async () => {
      await userService.register(expectedUserId, expectedPassword);

      expect(insertMock).toBeCalledWith({
        userId: expectedUserId,
        password: expectedPassword
      });
    });
  });
});
