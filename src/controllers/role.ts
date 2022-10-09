import { Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { BadRequestError } from "../errors/bad-request-error";
import { validateRequestFields } from "../middlewares/validate-request";
import { authenticateUser } from "../middlewares/authenticate-user";
import { Role } from "../models/role";
import { authorizeUser } from "../middlewares/authorize-user";
import { Permissions } from "../models/role";
import { User } from "../models/user";

// Controller: CreateRole
export const createRole = [
  authenticateUser,
  authorizeUser([Permissions.ManageUsers]),
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO

    //   await Role.deleteMany({});
    //   const role = await Role.create({
    //     name: "Test",
    //     permissions: {
    //       users: {
    //         manage: true,
    //       },
    //       roles: {
    //         manage: true,
    //       },
    //     },
    //   });
    //   const user = req.user;
    //   user?.roles.push(role);
    //   await user?.save();

    //   res.status(201).send(user);
    res.status(200).send("Success.");
  },
];

// Controller: CreateRole
export const getRoles = [
  authenticateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    // TODO
    const roles = await Role.find({});
    res.status(201).send(roles);
  },
];
