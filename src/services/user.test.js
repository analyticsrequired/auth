import UserService from "./user";
import db from "../db";

jest.mock("../db");

describe("UserService", () => {
  const expectedUserId = "expected id";
  const expectedPassword = "expected password";

  let userService;
  let insertMock;
  let firstMock;
  let whereMock;

  beforeEach(() => {
    insertMock = jest.fn(() => db);
    firstMock = jest.fn(() => db);
    whereMock = jest.fn(() => db);

    db.mockImplementation(() => {
      return {
        insert: insertMock,
        first: firstMock,
        where: whereMock
      };
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
