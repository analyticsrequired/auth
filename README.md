# @analyticsrequired/auth

An authentication service that serves JWTs.

## Usage

### Installation

- Clone this repository
- `$ npm run install`

### Running Development Server

- `$ npm run start:dev`

## Endpoints

### POST /token

Returns JWT if authentication succeeds.

#### Example Body

```json
{
  "id": "username",
  "password": "password"
}
```

#### Example JWT Payload

Permissions are translated to an array from the [scope string set on the user](https://www.npmjs.com/package/express-jwt-permissions#usage) in the database.

```json
{
  "id": "username",
  "permissions": ["admin"],
  "iat": 1551666744
}
```

#### Returns

| Status      | Body       | Content-Type |
| :---------- | :--------- | :----------- |
| 201 CREATED | JWT string | text/plain   |

### POST /register

Register a new user. Required for generating JWTs.

#### Example Body

```json
{
  "id": "username",
  "password": "password"
}
```

#### Returns

| Status      |
| :---------- |
| 201 CREATED |

## Scripts

- `build`: Builds to `dist/index.js`
- `start`: Start server without building
- `start:cold`: Start build then start server
- `start:dev`: Runs `start:cold` on code changes
- `test`: Runs all tests
- `preview`: Shows the files that will be bundled with `publish`
- `knex`: The knex cli
- `knex:latest`: Run migrations to latest
- `knex:reset`: Delete database and rerun migrations to latest
