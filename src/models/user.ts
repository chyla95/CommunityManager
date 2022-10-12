import mongoose from "mongoose";
import { Password } from "../services/password";
import { IRole, Permissions } from "./role";

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  roles: IRole[];

  isPasswordValid: (password: string) => Promise<boolean>;
  hasPermission: (permission: Permissions) => Promise<boolean>;
}

const schemaOptions: mongoose.SchemaOptions = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
      delete ret.password;
    },
  },
};

const schema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
  },
  schemaOptions
);

schema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.encrypt(this.get("password"));
    this.set("password", hashed);
  }
  done();
});

schema.methods.isPasswordValid = async function (password: string) {
  const isPasswordValid = await Password.compare(this.password, password);
  return isPasswordValid;
};

schema.methods.hasPermission = async function (permission: Permissions) {
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

export const User = mongoose.model<IUser>("User", schema);

// End of mongoose model
