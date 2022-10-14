import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { NotFoundError } from "../errors/not-found-error";
import { authorizeEmployee } from "../middlewares/authorize-employee";
import { Permissions } from "../models/role";
import { Employee } from "../models/employee";
import { User } from "../models/user";

// Controller: PromoteUserToEmployee
export const promoteUserToEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;

    const user = await User.findOne({ _id: userId });
    if (!user) {
      return next(new NotFoundError("User Not Found!"));
    }

    const employee = await Employee.create(user);

    res.status(201).send(employee);
  },
];

// Controller: GetEmployees
export const getEmployees = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employees = await Employee.find({}).populate("roles");

    res.status(200).send(employees);
  },
];

// Controller: GetEmployee
export const getEmployee = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const employeeId = req.params.employeeId;

    const employee = await Employee.findOne({ _id: employeeId }).populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    res.status(200).send(employee);
  },
];

// Controller: UpdateEmployee
export const updateEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const employeeId = req.params.employeeId;

    const employee = await Employee.findOne({ _id: employeeId }).populate("roles");
    if (!employee) {
      return next(new NotFoundError("Employee Not Found!"));
    }

    const isEmailTaken = await User.findOne({ _id: { $ne: employeeId }, email: email });
    if (isEmailTaken) {
      return next(new BadRequestError("User With This Email Already Exists!"));
    }

    if (password) employee.password = password;
    employee.email = email;
    await employee.save();

    res.status(201).send(employee);
  },
];

// Controller: DeleteEmployee
export const deleteEmployee = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll]),
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
