import UserService from "./user";
import db from "../db";

jest.mock("../db");

describe("UserService", () => {
  const expectedUserId = "expected id";
  const expectedPassword = "expected password";

  let userService;
  let insertMock;

  beforeEach(() => {
    insertMock = jest.fn(() => db);

    db.mockImplementation(() => {
      return {
        insert: insertMock
      };
    });

    userService = new UserService();
  });

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
