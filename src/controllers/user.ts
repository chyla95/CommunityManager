import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { issueJwt } from "../services/passport";
import { BadRequestError } from "../errors/httpErrors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/user";
import { isHashtagTag } from "../utilities/validators/is-hashtag-tag";
import { HttpStatusCode } from "../utilities/http-status-codes";

// Validation Rules
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

// Controller Functions
export const signUpUser = [
  validateRequest([...userCredentialValidationRules, ...userBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, discordTag, battleTag } = req.body;

    if (await isEmailTaken(email)) return next(new BadRequestError("This Email Is Taken!"));

    if (discordTag) {
      if (await isDiscordTagTaken(discordTag)) return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (battleTag) {
      if (await isBattleTagTaken(battleTag)) return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    const user = await User.create({ email: email, password: password, discordTag: discordTag, battleTag: battleTag });
    const jwt = issueJwt(user);

    res.status(HttpStatusCode.CREATED_201).send({ user, jwt });
  },
];

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

    res.status(HttpStatusCode.OK_200).send({ user, jwt });
  },
];

// Helper Functions
export const isDiscordTagTaken = async (discordTag: string) => {
  const isDiscordTagTaken = await User.findOne({ discordTag: discordTag });
  if (isDiscordTagTaken) return true;
  return false;
};

export const isBattleTagTaken = async (battleTag: string) => {
  const isbattleTagTaken = await User.findOne({ battleTag: battleTag });
  if (isbattleTagTaken) return true;
  return false;
};

export const isEmailTaken = async (email: string) => {
  const isEmailTaken = await User.findOne({ email: email });
  if (isEmailTaken) return true;
  return false;
};
