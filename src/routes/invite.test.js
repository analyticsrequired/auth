import jwt from "jsonwebtoken";
import UserService from "../services/user";
import { handler } from "./invite";

jest.mock("../services/user");
jest.mock("../logger");
jest.mock("jsonwebtoken");

describe("invite", () => {
  const expectedUserId = "expected user id";
  const expectedInviterId = "expected inviter id";
  const expectedJwtSecret = "expected jwt secret";
  const expectedToken = "expected token";

  let req;
  let res;
  let getByIdMock;

  beforeEach(() => {
    process.env.JWT_SECRET = expectedJwtSecret;

    UserService.mockClear();

    getByIdMock = jest.fn();
    getByIdMock.mockResolvedValue(false);

    UserService.mockImplementation(() => {
      return {
        getById: getByIdMock
      };
    });

    jwt.sign.mockReturnValue(expectedToken);

    req = {
      params: {
        userId: expectedUserId
      },
      body: {
        grant: ["foo", "bar"]
      },
      user: {
        id: expectedInviterId
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
        sub: expectedUserId,
        permissions: [],
        invitation: {
          grant: ["foo", "bar"],
          inviter: expectedInviterId
        }
      },
      expectedJwtSecret,
      {
        expiresIn: "1h"
      }
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
      getByIdMock.mockResolvedValue(true);
    });

    it("should return error to user", async () => {
      await handler(req, res);

      expect(res.status).toBeCalledWith(400);
      expect(res.json).toBeCalledWith({ error: "User already exists" });
    });
  });

  describe("when no grant is passed", () => {
    beforeEach(() => {
      delete req.body.grant;
    });

    it("should create correct jwt payload", async () => {
      await handler(req, res);

      expect(jwt.sign).toBeCalledWith(
        {
          sub: expectedUserId,
          permissions: [],
          invitation: {
            grant: [],
            inviter: expectedInviterId
          }
        },
        expectedJwtSecret,
        {
          expiresIn: "1h"
        }
      );
    });
  });
});
