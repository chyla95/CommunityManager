import mongoose from "mongoose";
import { IUser } from "./user";
import { IRole, Permissions } from "./role";
import { SystemError } from "../errors/system-error";

export interface IEmployee extends IUser {
  user: IUser;
  roles: IRole[];
  description: string;

  hasFullSystemAccess: () => boolean;
  hasPermission: (permission: Permissions) => boolean;
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
  },
};

const schema = new mongoose.Schema<IEmployee>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    description: { type: String },
  },
  schemaOptions
);

schema.methods.hasFullSystemAccess = function () {
  let hasPermission = false;

  for (const role of this.roles as IRole[]) {
    if (role.hasFullSystemAccess) {
      hasPermission = true;
      break;
    }
  }

  return hasPermission;
};

schema.methods.hasPermission = function (permission: Permissions) {
  let hasPermission = false;

  for (const role of this.roles as IRole[]) {
    switch (permission) {
      case Permissions.UsersManageAll: {
        if (role.permissions.users.manageAll === true) {
          hasPermission = true;
        }
        break;
      }
      case Permissions.RolesManageAll: {
        if (role.permissions.roles.manageAll === true) {
          hasPermission = true;
        }
        break;
      }
      default: {
        throw new SystemError("Permission Cannot Be Handled - Not Implemented Or Not Mapped!");
      }
    }
    if (hasPermission) break;
  }

  return hasPermission;
};

export const Employee = mongoose.model<IEmployee>("Employee", schema);
