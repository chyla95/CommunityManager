import { Strategy, ExtractJwt } from "passport-jwt";
import { sign } from "jsonwebtoken";
import { User as UserModel } from "../models/user";

const strategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_RSA_PUBLIC_KEY,
  algorithms: ["RS256"],
};

// app.js will pass the global passport object here, and this function will configure it
export const verifyJWT = (passport: any) => {
  // The JWT payload is passed into the verify callback
  passport.use(
    new Strategy(strategyOptions, function (jwt_payload, done) {
      console.log(jwt_payload);

      // We will assign the `sub` property on the JWT to the database ID of user
      UserModel.findOne({ _id: jwt_payload.sub }, function (err: any, user: any) {
        // This flow look familiar?  It is the same as when we implemented
        // the `passport-local` strategy
        if (err) {
          return done(err, false);
        }
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    })
  );
};

// declare global {
//   namespace Express {
//     interface User extends IUser {
//       _id: string;
//     }
//   }
// }

declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}

export const issueJWT = (user: any) => {
  const _id = user._id;

  const expiresIn = "1d";

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  if (!process.env.JWT_RSA_PRIVATE_KEY) {
    throw new Error("JWT_RSA_PRIVATE_KEY is not defined!");
  }

  const signedToken = sign(payload, process.env.JWT_RSA_PRIVATE_KEY, {
    expiresIn: expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
};
