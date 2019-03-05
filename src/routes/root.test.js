import { handler } from "./root";

describe("root", () => {
  it("should send name of service", () => {
    const res = {
      send: jest.fn()
    };

    handler(null, res);

    expect(res.send).toBeCalledWith("Analytics Required Auth Service");
  });
});
