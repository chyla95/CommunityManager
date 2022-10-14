import mongoose from "mongoose";
import { User, IUser } from "./user";
import { IRole, Permissions } from "./role";
import { isHashtagTag } from "../utilities/validators/is-hashtag-tag";

export interface IStaff extends IUser {
  // discordTag: string;
  // battleTag: string;
  description: string;
  roles: IRole[];

  hasFullSystemAccess: () => boolean;
  hasPermission: (permission: Permissions) => boolean;
}

const schema = new mongoose.Schema<IStaff>({
  // discordTag: { type: String, required: true, unique: true, validate: [isHashtagTag, 'Invalid "discordTag" Value!'] },
  // battleTag: { type: String, required: true, unique: true, validate: [isHashtagTag, 'Invalid "battleTag" Value!'] },
  description: { type: String },
  roles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
  ],
});

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
        // TODO: Change/Implement to "SystemError"
        throw new Error("Permission Cannot Be Handled - Not Implemented Or Not Mapped.");
      }
    }
    if (hasPermission) break;
  }

  return hasPermission;
};

export const Staff = User.discriminator<IStaff>("Staff", schema);
