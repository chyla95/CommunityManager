import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { NotFoundError } from "../errors/not-found-error";
import { authorizeEmployee } from "../middlewares/authorize-employee";
import { Permissions } from "../models/role";
import { Employee } from "../models/employee";
import { User } from "../models/user";
import { isHashtagTag } from "../utilities/validators/is-hashtag-tag";

// Validation Rules
const employeeBodyValidationRules = [
  body("description", "Description cannot be longer than 50 characters.").isLength({ max: 50 }),
  body("description", "Description has to be Alphanumeric (numbers and letters only).").isAlphanumeric(),
  body("email", "Invalid e-mail adress.").isEmail().normalizeEmail(),
  body("password", "Password has to be between 5 and 50 characters long.").optional().isLength({ min: 5, max: 50 }),
];

const employeeTagsBodyValidationRules = [
  body("discordTag").custom((value) => {
    return isHashtagTag(value);
  }),
  body("battleTag").custom((value) => {
    return isHashtagTag(value);
  }),
];

// Controller Functions
export const getCurrentEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;

    res.status(200).send(employee);
  },
];

export const createEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  validateRequest([...employeeTagsBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { discordTag, battleTag } = req.body;
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    const employee = await Employee.findOne({ _id: userId });
    if (employee) {
      return next(new NotFoundError("User Is Already Promoted To Employee!"));
    }

    if (!discordTag && !user.discordTag) return next(new BadRequestError("Discord Tag Is Required!"));
    if (!battleTag && !user.battleTag) return next(new BadRequestError("Battle Tag Is Required!"));

    if (await isDiscordTagTaken(discordTag, userId)) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (await isBattleTagTaken(battleTag, userId)) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    const createdEmployee = await Employee.create({
      _id: user.id,
      user: user,
    });

    res.status(201).send(createdEmployee);
  },
];

export const getEmployees = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employees = await Employee.find({}).populate("user").populate("roles");

    res.status(200).send(employees);
  },
];

export const getEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  validateRequest([param("employeeId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.employeeId;

    const employee = await Employee.findOne({ _id: employeeId }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    res.status(200).send(employee);
  },
];

export const updateEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  validateRequest([...employeeBodyValidationRules, ...employeeTagsBodyValidationRules, param("employeeId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, discordTag, battleTag, description } = req.body;
    const employeeId = req.params.employeeId;

    const employee = await Employee.findOne({ _id: employeeId }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    const user = await User.findOne({ _id: employeeId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    if (email && (await isEmailTaken(email, employeeId))) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (discordTag && (await isDiscordTagTaken(discordTag, employeeId))) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (battleTag && (await isBattleTagTaken(battleTag, employeeId))) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    if (email) user.email = email;
    if (password) user.password = password;
    if (discordTag) user.discordTag = discordTag;
    if (battleTag) user.battleTag = battleTag;
    if (description) employee.description = description;

    await employee.save();
    await user.save();

    const updatedEmployee = await Employee.findOne({ _id: employeeId }).populate("user").populate("roles");
    res.status(200).send(updatedEmployee);
  },
];

export const deleteEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  validateRequest([param("employeeId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.employeeId;

    const employee = await Employee.findOne({ _id: employeeId });
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    await employee.delete();

    res.status(204).send(employee);
  },
];

// Helper Functions
const isDiscordTagTaken = async (discordTag: string, userId: string) => {
  const isDiscordTagTaken = await User.findOne({ _id: { $ne: userId }, discordTag: discordTag });
  if (isDiscordTagTaken) return true;
  return false;
};

const isBattleTagTaken = async (battleTag: string, userId: string) => {
  const isbattleTagTaken = await User.findOne({ _id: { $ne: userId }, battleTag: battleTag });
  if (isbattleTagTaken) return true;
  return false;
};

const isEmailTaken = async (email: string, userId: string) => {
  const isEmailTaken = await User.findOne({ _id: { $ne: userId }, email: email });
  if (isEmailTaken) return true;
  return false;
};
