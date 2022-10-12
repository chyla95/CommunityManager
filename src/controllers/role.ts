import { Request, Response, NextFunction } from "express";
import { body, param } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequest, handleValidationErrors } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { Role, IRole } from "../models/role";
import { authorizeUser } from "../middlewares/authorize-user";
import { Permissions } from "../models/role";
import { User } from "../models/user";
import { NotFoundError } from "../errors/not-found-error";

const roleBodyValidationRules = [
  body("name").isAlphanumeric("en-US", { ignore: " " }).isLength({ min: 3 }).trim(),
  body("permissions.users.manageAll").optional().isBoolean(),
  body("permissions.roles.manageAll").optional().isBoolean(),
];

// Controller: CreateRole
export const createRole = [
  authenticateUser,
  authorizeUser([Permissions.RolesManageAll]),
  validateRequest(roleBodyValidationRules),
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, permissions } = req.body;

    const isRoleNameTaken = await Role.findOne({ name: name });
    if (isRoleNameTaken) {
      return next(new BadRequestError("Role With This Name Already Exists!"));
    }

    const role = await Role.create({
      name: name,
      permissions: permissions,
    });

    res.status(201).send(role);
  },
];

// Controller: GetRole
export const getRole = [
  authenticateUser,
  param("roleId").optional().isMongoId(),
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    const roleId = req.params.roleId;
    let roles: IRole[] = [];

    if (roleId) {
      const role = await Role.findOne({ _id: roleId });
      if (!role) {
        return next(new NotFoundError("Role Not Found!"));
      }
      roles.push(role);
    } else {
      roles = await Role.find({});
    }

    res.status(201).send(roles);
  },
];

// Controller: UpdateRole
export const updateRole = [
  authenticateUser,
  authorizeUser([Permissions.RolesManageAll]),
  validateRequest(roleBodyValidationRules),
  param("roleId").isMongoId(),
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, permissions } = req.body;
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
    role.permissions = permissions;
    await role.save();

    res.status(201).send(role);
  },
];

// Controller: DeleteRole
export const deleteRole = [
  authenticateUser,
  authorizeUser([Permissions.RolesManageAll]),
  param("roleId").isMongoId(),
  handleValidationErrors,
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
  authorizeUser([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("userId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roleId } = req.body;

    const user = await User.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new BadRequestError("This User Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesUserHasRole = user.roles.find((r) => {
      return r.id == role.id;
    });
    if (doesUserHasRole) {
      return next(new BadRequestError("User Already Has This Role!"));
    }

    user.roles.push(role);
    await user.save();

    res.status(201).send(user);
  },
];

// Controller: RetractRole
export const retractRole = [
  authenticateUser,
  authorizeUser([Permissions.UsersManageAll, Permissions.RolesManageAll]),
  validateRequest([body("userId").isMongoId(), body("roleId").isMongoId()]),
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId, roleId } = req.body;

    const user = await User.findOne({ _id: userId }).populate("roles");
    if (!user) {
      return next(new BadRequestError("This User Doesn't Exists!"));
    }

    const role = await Role.findOne({ _id: roleId });
    if (!role) {
      return next(new BadRequestError("This Role Doesn't Exists!"));
    }

    const doesUserHasRole = user.roles.find((r) => {
      return r.id == role.id;
    });
    if (!doesUserHasRole) {
      return next(new BadRequestError("User Doesn't have This Role!"));
    }

    user.roles = user.roles.filter((r) => {
      return r.id !== role.id;
    });
    await user.save();

    res.status(204).send();
  },
];
