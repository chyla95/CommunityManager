import { Request, Response, NextFunction } from "express";
import { User } from "../models/user";
import { issueJwt } from "../services/passport";
import { BadRequestError } from "../errors/bad-request-error";

// Controller: SignUp
export const signUpUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const doesUserExist = await User.findOne({ email: email });
  if (doesUserExist) {
    return next(new BadRequestError("Invalid Credentials!"));
  }

  const user = (await User.create({ email: email, password: password })) as User;
  const jwt = issueJwt(user);

  res.status(201).send({ user, jwt });
};

// Controller: SignIn
export const signInUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = (await User.findOne({ email: email })) as User;
  if (!user) {
    return next(new BadRequestError("Invalid Credentials!"));
  }

  const isPasswordValid = user.isPasswordValid(password);
  if (!isPasswordValid) {
    return next(new BadRequestError("Invalid Credentials!"));
  }

  const jwt = issueJwt(user);

  res.status(200).send({ user, jwt });
};

// Controller: GetCurrentUser
export const getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new BadRequestError("No User Is Logged In!"));
  }

  const user = (await User.findOne({ _id: req.user.id })) as User;
  if (!user) {
    return next(new BadRequestError("User Not Found!"));
  }

  res.status(200).send({ user });
};
