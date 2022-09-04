import passport from "passport";

export const authenticateUser = passport.authenticate("jwt", { session: false });
