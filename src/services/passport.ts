import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Algorithm, default as jsonwebtoken } from "jsonwebtoken";
import { User, IUser } from "../models/user";
import { jwtConfiguration } from "../configuration/jwt-configuration";

const strategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_RSA_PUBLIC_KEY!,
  algorithms: [jwtConfiguration.cryptographyAlgorithm],
};

passport.use(
  new Strategy(strategyOptions, async (payload, done) => {
    try {
      const user = await User.findOne({ _id: payload.userId });
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export const issueJwt = (user: IUser) => {
  const payload = {
    userId: user.id,
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_RSA_PRIVATE_KEY!, {
    expiresIn: jwtConfiguration.expirationTime,
    algorithm: jwtConfiguration.cryptographyAlgorithm as Algorithm,
  });

  return {
    token: signedToken,
    expirationTime: jwtConfiguration.expirationTime,
  };
};

// Extends "req.user" with "IUser" properties
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
