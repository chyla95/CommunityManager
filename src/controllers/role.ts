import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { Role } from "../models/role";
import { authorizeEmployee } from "../middlewares/authorize-employee";
import { Permissions } from "../models/role";
import { NotFoundError } from "../errors/not-found-error";
import { Employee } from "../models/employee";

const roleBodyValidationRules = [
  body("name").isAlphanumeric("en-US", { ignore: " " }).isLength({ min: 3 }).trim(),
  body("hasFullSystemAccess").optional().isBoolean(),
  body("hierarchyLevel").isInt(),
  body("decorationColor").isHexColor(),
  body("permissions.users.manageAll").optional().isBoolean(),
  body("permissions.roles.manageAll").optional().isBoolean(),
];

// Controller: CreateRole
export const createRole = [
  authenticateUser,
  authorizeEmployee([Permissions.RolesManageAll]),
  validateRequest([...roleBodyValidationRules]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, hasFullSystemAccess, hierarchyLevel, decorationColor, permissions } = req.body;

    const isRoleNameTaken = await Role.findOne({ name: name });
    if (isRoleNameTaken) {
      return next(new BadRequestError("Role With This Name Already Exists!"));
    }

    const role = await Role.create({
      name: name,
      hasFullSystemAccess: hasFullSystemAccess,
      hierarchyLevel: hierarchyLevel,
      decorationColor: decorationColor,
      permissions: permissions,
    });

    res.status(201).send(role);
  },
];

// Controller: GetRoles
export const getRoles = [
  authenticateUser,
  authorizeEmployee([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.find({});

    res.status(201).send(role);
  },
];

// Controller: GetRole
export const getRole = [
  authenticateUser,
  authorizeEmployee([]),
  validateRequest([param("roleId").optional().isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const roleId = req.params.roleId;

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new NotFoundError("Role Not Found!"));
    }

    res.status(201).send(role);
  },
];

// Controller: UpdateRole
export const updateRole = [
  authenticateUser,
  authorizeEmployee([Permissions.RolesManageAll]),
  validateRequest([...roleBodyValidationRules, param("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, hasFullSystemAccess, hierarchyLevel, decorationColor, permissions } = req.body;
    const roleId = req.params.roleId;

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new NotFoundError("Role Not Found!"));
    }

    const isRoleNameTaken = await Role.findOne({ _id: { $ne: roleId }, name: name });
    if (isRoleNameTaken) {
      return next(new BadRequestError("Role With This Name Already Exists!"));
    }

    role.name = name;
    role.hasFullSystemAccess = hasFullSystemAccess;
    role.hierarchyLevel = hierarchyLevel;
    role.decorationColor = decorationColor;
    role.permissions = permissions;
    await role.save();

    res.status(201).send(role);
  },
];

// Controller: DeleteRole
export const deleteRole = [
  authenticateUser,
  authorizeEmployee([Permissions.RolesManageAll]),
  validateRequest([param("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const roleId = req.params.roleId;

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new NotFoundError("Role Not Found!"));
    }

    await role.delete();

    res.status(204).send();
  },
];

// Controller: assignRole
export const assignRole = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("employeeId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { employeeId, roleId } = req.body;

    const employee = await Employee.findOne({ _id: employeeId }).populate("roles");
    if (!employee) {
      return next(new BadRequestError("This Employee Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesEmployeeHasRole = employee.roles.find((r) => {
      return r.id == role.id;
    });
    if (doesEmployeeHasRole) {
      return next(new BadRequestError("Employee Already Has This Role!"));
    }

    employee.roles.push(role);
    await employee.save();

    res.status(201).send(employee);
  },
];

// Controller: RetractRole
export const retractRole = [
  authenticateUser,
  authorizeEmployee([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("employeeId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { employeeId, roleId } = req.body;

    const employee = await Employee.findOne({ _id: employeeId }).populate("roles");
    if (!employee) {
      return next(new BadRequestError("This Employee Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesEmployeeHasRole = employee.roles.find((r) => {
      return r.id == role.id;
    });
    if (!doesEmployeeHasRole) {
      return next(new BadRequestError("Employee Doesn't have This Role!"));
    }

    employee.roles = employee.roles.filter((r) => {
      return r.id !== role.id;
    });
    await employee.save();

    res.status(204).send();
  },
];
