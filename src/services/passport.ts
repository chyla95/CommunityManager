import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Algorithm, default as jsonwebtoken } from "jsonwebtoken";
import { User as UserModel } from "../models/user";
import { configJwt } from "../configuration/configuration";

const strategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_RSA_PUBLIC_KEY!,
  algorithms: [configJwt.cryptographyAlgorithm],
};

passport.use(
  new Strategy(strategyOptions, async (payload, done) => {
    try {
      const user = await UserModel.findOne({ _id: payload.userId });
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  })
);

export const issueJwt = (user: UserModel) => {
  const payload = {
    userId: user._id,
  };

  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_RSA_PRIVATE_KEY!, {
    expiresIn: configJwt.expirationTime,
    algorithm: configJwt.cryptographyAlgorithm as Algorithm,
  });

  return {
    token: signedToken,
    expirationTime: configJwt.expirationTime,
  };
};

// Extending "req.user" with "UserModel" model's properties
declare global {
  namespace Express {
    interface User extends UserModel {}
  }
}
