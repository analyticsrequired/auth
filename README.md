# @analyticsrequired/auth

An authentication service that serves JWTs.

## Usage

### Installation

- Clone this repository
- `$ npm run install`

### Running

- `$ npm run start`

### JWT_SECRET

JWTs generated are signed by the `JWT_SECRET` environment variable which must be set before starting server.

### JWT_REFRESH_SECRET

Refresh JWTs generated are signed by the `JWT_REFRESH_SECRET` environment variable which must be set before starting server.

## Development

See [development wiki](https://github.com/analyticsrequired/auth/wiki/Development).

### Scripts

- `build`: Builds to `dist/index.js`
- `start`: Start server without building
- `start:cold`: Start build then start server
- `start:dev`: Runs `start:cold` on code changes
- `test`: Runs all tests
- `preview`: Shows the files that will be bundled with `publish`
- `knex`: The knex cli
- `knex:latest`: Run migrations to latest
- `knex:reset`: Delete database and rerun migrations to latest

## Endpoints

### POST /register

Register a new user. Required for generating JWTs.

### Permissions Required

- invitation

#### Example Body

```json
{
  "userId": "userid",
  "password": "password"
}
```

#### Returns

| Status      |
| :---------- |
| 201 CREATED |

### POST /token

Returns JWT if authentication succeeds.

#### Example Body

```json
{
  "id": "userId",
  "password": "password"
}
```

#### Returns

| Status      | Body       | Content-Type |
| :---------- | :--------- | :----------- |
| 201 CREATED | JWT string | text/plain   |

##### JWT Payload

```json
{
  "sub": "userId",
  "iat": 0000000000,
  "exp": 0000000000
}
```

### POST /refresh

Uses refresh token to get access token.

#### Headers

| Header         | Value         |
| :------------- | :------------ |
| Authentication | REFRESH_TOKEN |

#### Returns

| Status      | Body       | Content-Type |
| :---------- | :--------- | :----------- |
| 201 CREATED | JWT string | text/plain   |

##### JWT Payload

```json
{
  "sub": "userId",
  "permissions": ["... users permissions"],
  "iat": 0000000000,
  "exp": 0000000000
}
```
