import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { NotFoundError } from "../errors/not-found-error";
import { authorizeStaff } from "../middlewares/authorize-staff";
import { Permissions } from "../models/role";
import { Staff } from "../models/staff";
import { User } from "../models/user";

// Controller: UpdateUser
export const promoteUserToStaff = [
  authenticateUser,
  //authorizeStaff([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    const staff = await Staff.create(user);

    res.status(201).send(staff);
  },
];

// Controller: GetStaff
export const getUsers = [
  authenticateUser,
  authorizeStaff([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await Staff.find({}).populate("roles");

    res.status(200).send(users);
  },
];

// Controller: GetStaff
export const getUser = [
  authenticateUser,
  authorizeStaff([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.staffId;

    const user = await Staff.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    res.status(200).send(user);
  },
];

// Controller: UpdateStaff
export const updateUser = [
  authenticateUser,
  authorizeStaff([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const userId = req.params.staffId;

    const user = await Staff.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    const isEmailTaken = await Staff.findOne({ _id: { $ne: userId }, email: email });
    if (isEmailTaken) {
      return next(new BadRequestError("User With This Email Already Exists!"));
    }

    if (password) user.password = password;
    user.email = email;
    await user.save();

    res.status(201).send(user);
  },
];

// Controller: DeleteStaff
export const deleteUser = [
  authenticateUser,
  authorizeStaff([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.staffId;

    const user = await Staff.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    await user.delete();

    res.status(204).send(user);
  },
];
