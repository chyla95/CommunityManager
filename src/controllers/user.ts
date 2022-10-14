import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { issueJwt } from "../services/passport";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { User } from "../models/user";
import { isHashtagTag } from "../utilities/validators/is-hashtag-tag";

const userCredentialValidationRules = [
  body("email", "Invalid e-mail adress.").isEmail().normalizeEmail(),
  body("password", "Password has to be between 5 and 50 characters long.").isLength({ min: 5, max: 50 }),
];

const userBodyValidationRules = [
  body("discordTag")
    .optional()
    .custom((value) => {
      return isHashtagTag(value);
    }),
  body("battleTag")
    .optional()
    .custom((value) => {
      return isHashtagTag(value);
    }),
];

// Controller: SignUp
export const signUpUser = [
  validateRequest([...userCredentialValidationRules, ...userBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, discordTag, battleTag } = req.body;

    const isEmailTaken = await User.findOne({ email: email });
    if (isEmailTaken) {
      return next(new BadRequestError("This Email Is Taken!"));
    }

    const isdiscordTagTaken = await User.findOne({ discordTag: discordTag });
    if (isdiscordTagTaken) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    const isbattleTagTaken = await User.findOne({ battleTag: battleTag });
    if (isbattleTagTaken) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    const user = await User.create({ email: email, password: password, discordTag: discordTag, battleTag: battleTag });
    const jwt = issueJwt(user);

    res.status(201).send({ user, jwt });
  },
];

// Controller: SignIn
export const signInUser = [
  validateRequest([...userCredentialValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      return next(new BadRequestError("Invalid Credentials!"));
    }

    const isPasswordValid = await user.isPasswordValid(password);
    if (!isPasswordValid) {
      return next(new BadRequestError("Invalid Credentials!"));
    }

    const jwt = issueJwt(user);

    res.status(200).send({ user, jwt });
  },
];

// Controller: GetCurrentUser
export const getCurrentUser = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new BadRequestError("No User Is Logged In!"));
    }

    res.status(200).send(user);
  },
];
