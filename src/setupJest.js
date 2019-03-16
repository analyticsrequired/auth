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

export const mockUserService = UserServiceClass => {
  const mockImplementation = {
    getById: jest.fn(),
    register: jest.fn(),
    grant: jest.fn()
  };

  UserServiceClass.mockImplementation(() => mockImplementation);

  return mockImplementation;
};
