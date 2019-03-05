import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./invite";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("invite", () => {
  const expectedUsername = "test username";
  const expectedInviterUsername = "test inviter username";
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";

  let req;
  let res;
  let getByUsernameMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();

    getByUsernameMock = jest.fn();
    getByUsernameMock.mockResolvedValue(false);

    UserService.mockImplementation(() => {
      return {
        getByUsername: getByUsernameMock
      };
    });

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      params: {
        username: expectedUsername
      },
      body: {
        grant: ["foo", "bar"]
      },
      user: {
        username: expectedInviterUsername
      }
    };

    res = {
      send: jest.fn(() => res),
      status: jest.fn(() => res),
      json: jest.fn(() => res),
      set: jest.fn(() => res)
    };
  });

  it("should create correct jwt payload", async () => {
    await handler(req, res);

    expect(jwt.sign).toBeCalledWith(
      {
        id: expectedUsername,
        permissions: ["invitation"],
        grant: ["foo", "bar"],
        inviter: req.user.username
      },
      expectedJwtSecret
    );
  });

  it("should return correct response", async () => {
    await handler(req, res);

    expect(res.status).toBeCalledWith(201);
    expect(res.set).toBeCalledWith("Content-Type", "plain/text");
    expect(res.send).toBeCalledWith(expectedToken);
  });

  describe("when user already registered", () => {
    beforeEach(() => {
      getByUsernameMock.mockResolvedValue(true);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({ error: "User already exists" });
    });
  });
});
