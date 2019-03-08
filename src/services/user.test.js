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
      username: expectedUserId
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
    it("should return first found", async () => {
      await userService.getById(expectedUserId);
      expect(firstMock).toBeCalled();
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

    it("should map id", async () => {
      const user = await userService.getById(expectedUserId);
      expect(user.id).toEqual(expectedUserId);
    });

    it("should remove username", async () => {
      const user = await userService.getById(expectedUserId);
      expect(user.username).toBeUndefined();
    });
  });

  describe("register", () => {
    it("should call insert correctly", async () => {
      await userService.register(expectedUserId, expectedPassword, [
        "foo",
        "bar"
      ]);

      expect(insertMock).toBeCalledWith({
        username: expectedUserId,
        password: expectedPassword,
        scope: "foo bar"
      });
    });

    describe("when no grant is set", () => {
      it("should not set scope", async () => {
        await userService.register(expectedUserId, expectedPassword);

        expect(insertMock).toBeCalledWith({
          username: expectedUserId,
          password: expectedPassword,
          scope: ""
        });
      });
    });
  });
});
