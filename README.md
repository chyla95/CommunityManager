# CommunityManager

This project is a part of system for managing _World of Warcraft_ boosting community.
It serves a purpose of a REST API server for the _client app_ to use.

**Project Status**: In Development

## Installation

Before starting the app, it is required to:

1.  create a [MongoDB](https://www.mongodb.com/) database, and obtain `mongodb_connection_string`,
2.  generate a [Key-Pair](https://github.com/chyla95/KeyPairGenerator) (`public_key` and `private_key`), for securing the _JWT authentication_ mechanism.

**MongoDB** connection string and the **JWT Key-Pair** should be next provided as _Environment Variables_, with the following names, for the app to work:
| Variable Name | Key |
|--|--|
| `DATABASE_URL` | `mongodb_connection_string` |
| `JWT_RSA_PRIVATE_KEY` | `private_key` |
| `JWT_RSA_PUBLIC_KEY` | `public_key` |

**The application can be launched with the following commands:**

- `npm install` - to download and install all the dependencies;
- `npm run start:dev` - to start the application in **_development environment_**;
- `npm start` - to start the application in **_production environment_**;
- `npm test:watch` - to start _test-suit_ in **watch** mode;
- `npm test` - to run all defined tests **once**.

## Useful Resources

- [MongoDB Atlas](https://www.mongodb.com/)
- [Key-Pair Generator](https://github.com/chyla95/KeyPairGenerator)
