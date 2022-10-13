import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { User, IUser } from "../models/user";
import { issueJwt } from "../services/passport";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { NotFoundError } from "../errors/not-found-error";
import { authorizeUser } from "../middlewares/authorize-user";
import { Permissions } from "../models/role";

const userCredentialValidationRules = [
  body("email", "Invalid e-mail adress.").isEmail().normalizeEmail(),
  body("password", "Password has to be between 5 and 50 characters long.").isLength({ min: 5, max: 50 }),
];

// Controller: GetUsers
export const getUsers = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await User.find({}).populate("roles");

    res.status(200).send(users);
  },
];

// Controller: GetUser
export const getUser = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    res.status(200).send(user);
  },
];

// Controller: UpdateUser
export const updateUser = [
  authenticateUser,
  authorizeUser([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    const isEmailTaken = await User.findOne({ _id: { $ne: userId }, email: email });
    if (isEmailTaken) {
      return next(new BadRequestError("User With This Email Already Exists!"));
    }

    if (password) user.password = password;
    user.email = email;
    await user.save();

    res.status(201).send(user);
  },
];

// Controller: DeleteUser
export const deleteUser = [
  authenticateUser,
  authorizeUser([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    await user.delete();

    res.status(204).send(user);
  },
];

// Controller: SignUp
export const signUpUser = [
  validateRequest([...userCredentialValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const isEmailTaken = await User.findOne({ email: email });
    if (isEmailTaken) {
      return next(new BadRequestError("This Email Is Taken!"));
    }

    const user = await User.create({ email: email, password: password });
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
