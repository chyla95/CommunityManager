import { Request, Response, NextFunction } from "express";
import { body, param, query } from "express-validator";
import { BadRequestError } from "../errors/httpErrors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { NotFoundError } from "../errors/httpErrors/not-found-error";
import { authorizeEmployee } from "../middlewares/authorize-employee";
import { Permissions, Role } from "../models/role";
import { Employee, IEmployee } from "../models/employee";
import { AccountStatus, User } from "../models/user";
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

const employeePaginationValidationRules = [
  query("page").optional().isInt({ min: 1 }),
  query("pageSize").optional().isInt({ min: 1 }),
  query("sortBy").optional().isAlphanumeric(),
  query("sortBy").optional().isIn(["id", "email", "discordTag", "battleTag", "status"]),
  query("sortingOrder").optional().isAlphanumeric(),
  query("sortingOrder").optional().isIn(["asc", "desc"]),
];

// Controller Functions
export const applyAsEmployee = [
  authenticateUser,
  validateRequest([...employeeTagsBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { discordTag, battleTag } = req.body;

    const user = req.user;
    if (!user) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    const employee = await Employee.findOne({ user: user.id });
    if (employee) {
      return next(new NotFoundError("You Are Already Promoted To Employee!"));
    }

    if (!discordTag && !user.discordTag) return next(new BadRequestError("Discord Tag Is Required!"));
    if (!battleTag && !user.battleTag) return next(new BadRequestError("Battle Tag Is Required!"));

    if (await isDiscordTagTaken(discordTag, user.id)) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (await isBattleTagTaken(battleTag, user.id)) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    if (discordTag) user.discordTag = discordTag;
    if (battleTag) user.battleTag = battleTag;
    await user.save();

    const createdEmployee = await Employee.create({
      _id: user.id,
      user: user.id,
    });

    user.function.employee = createdEmployee;
    await user.save();

    res.status(201).send(createdEmployee);
  },
];

export const getCurrentEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;

    res.status(200).send(employee);
  },
];

export const updateCurrentEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  validateRequest([...employeeBodyValidationRules, ...employeeTagsBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, discordTag, battleTag, description } = req.body;

    const employee = req.employee;
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    const user = req.user;
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    if (email && (await isEmailTaken(email, employee.id))) {
      return next(new BadRequestError("This Email Is Taken!"));
    }

    if (discordTag && (await isDiscordTagTaken(discordTag, employee.id))) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (battleTag && (await isBattleTagTaken(battleTag, employee.id))) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    if (email) user.email = email;
    if (password) user.password = password;
    if (discordTag) user.discordTag = discordTag;
    if (battleTag) user.battleTag = battleTag;
    if (description) employee.description = description;

    await employee.save();
    await user.save();

    const updatedEmployee = await Employee.findOne({ user: user.id }).populate("user").populate("roles");
    res.status(200).send(updatedEmployee);
  },
];

export const deleteCurrentEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employee = req.employee;
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    await employee.delete();

    res.status(204).send(employee);
  },
];

export const getEmployees = [
  authenticateUser,
  authorizeEmployee([]),
  validateRequest([...employeePaginationValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { page, pageSize, sortBy = "id", sortingOrder = "asc" } = req.query;

    let employees: IEmployee[];

    let sortingOptions: any;
    if (sortBy == "id") sortingOptions = { _id: sortingOrder };
    if (sortBy == "email") sortingOptions = { "userLookup.email": sortingOrder };
    if (sortBy == "discordTag") sortingOptions = { "userLookup.discordTag": sortingOrder };
    if (sortBy == "battleTag") sortingOptions = { "userLookup.battleTag": sortingOrder };
    if (sortBy == "status") sortingOptions = { "userLookup.status": sortingOrder };

    if (page && pageSize) {
      employees = await Employee.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "userLookup",
          },
        },
      ])
        .sort(sortingOptions)
        .skip((+page - 1) * +pageSize)
        .limit(+pageSize);

      await Role.populate(employees, { path: "roles" });
      await User.populate(employees, { path: "user" });
      employees.forEach((e: any) => {
        delete e.userLookup;
      });
    } else {
      employees = await Employee.find({}, null, { sort: sortingOptions }).populate("user").populate("roles");
    }

    res.status(200).send(employees);
  },
];

export const getEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  validateRequest([param("userId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const employee = await Employee.findOne({ user: userId }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    res.status(200).send(employee);
  },
];

export const updateEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  validateRequest([...employeeBodyValidationRules, ...employeeTagsBodyValidationRules, body("status").isIn(Object.values(AccountStatus)), param("userId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, discordTag, battleTag, description, status } = req.body;
    const userId = req.params.userId;

    const employee = await Employee.findOne({ user: userId }).populate("user").populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    if (email && (await isEmailTaken(email, userId))) {
      return next(new BadRequestError("This Email Is Taken!"));
    }

    if (discordTag && (await isDiscordTagTaken(discordTag, userId))) {
      return next(new BadRequestError("This Discord Tag Is Taken!"));
    }

    if (battleTag && (await isBattleTagTaken(battleTag, userId))) {
      return next(new BadRequestError("This Battle Tag Is Taken!"));
    }

    if (email) user.email = email;
    if (password) user.password = password;
    if (discordTag) user.discordTag = discordTag;
    if (battleTag) user.battleTag = battleTag;
    if (status) user.status = status;
    if (description) employee.description = description;

    await employee.save();
    await user.save();

    const updatedEmployee = await Employee.findOne({ user: userId }).populate("user").populate("roles");
    res.status(200).send(updatedEmployee);
  },
];

export const deleteEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  validateRequest([param("userId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const employee = await Employee.findOne({ user: userId });
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
