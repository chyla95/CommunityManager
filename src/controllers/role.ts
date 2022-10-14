import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { Role } from "../models/role";
import { authorizeStaff } from "../middlewares/authorize-staff";
import { Permissions } from "../models/role";
import { NotFoundError } from "../errors/not-found-error";
import { Staff } from "../models/staff";

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
  authorizeStaff([Permissions.RolesManageAll]),
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
  authorizeStaff([]),
  async (req: Request, res: Response, next: NextFunction) => {
    const role = await Role.find({});

    res.status(201).send(role);
  },
];

// Controller: GetRole
export const getRole = [
  authenticateUser,
  authorizeStaff([]),
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
  authorizeStaff([Permissions.RolesManageAll]),
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
  authorizeStaff([Permissions.RolesManageAll]),
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
  authorizeStaff([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("staffId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { staffId, roleId } = req.body;

    const staff = await Staff.findOne({ _id: staffId }).populate("roles");
    if (!staff) {
      return next(new BadRequestError("This User Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesStaffHasRole = staff.roles.find((r) => {
      return r.id == role.id;
    });
    if (doesStaffHasRole) {
      return next(new BadRequestError("User Already Has This Role!"));
    }

    staff.roles.push(role);
    await staff.save();

    res.status(201).send(staff);
  },
];

// Controller: RetractRole
export const retractRole = [
  authenticateUser,
  authorizeStaff([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("staffId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { staffId, roleId } = req.body;

    const staff = await Staff.findOne({ _id: staffId }).populate("roles");
    if (!staff) {
      return next(new BadRequestError("This User Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesStaffHasRole = staff.roles.find((r) => {
      return r.id == role.id;
    });
    if (!doesStaffHasRole) {
      return next(new BadRequestError("User Doesn't have This Role!"));
    }

    staff.roles = staff.roles.filter((r) => {
      return r.id !== role.id;
    });
    await staff.save();

    res.status(204).send();
  },
];
