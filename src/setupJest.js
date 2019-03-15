export const mockResponse = () => {
  let response;

  response = {
    status: jest.fn(() => response),
    send: jest.fn(() => response),
    json: jest.fn(() => response),
    set: jest.fn(() => response),
    end: jest.fn(() => response)
  };

  return response;
};
