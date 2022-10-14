import mongoose from "mongoose";
import { isHexColor } from "../utilities/validators/is-hex-color";

export interface IRole extends mongoose.Document {
  name: string;
  hasFullSystemAccess: boolean;
  hierarchyLevel: number;
  decorationColor: string;
  permissions: {
    users: {
      manageAll: boolean;
    };
    roles: {
      manageAll: boolean;
    };
  };
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

// Naming: manageAll / manageOwn
const schema = new mongoose.Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
    hasFullSystemAccess: { type: Boolean },
    hierarchyLevel: { type: Number, required: true, validate: [Number.isInteger, 'Invalid "hierarchyLevel" Value!'] },
    decorationColor: { type: String, required: true, validate: [isHexColor, 'Invalid "decorationColor" Value!'] },
    permissions: {
      users: {
        manageAll: { type: Boolean },
      },
      roles: {
        manageAll: { type: Boolean },
      },
    },
  },
  schemaOptions
);

export const Role = mongoose.model<IRole>("Role", schema);

// End of mongoose model

export enum Permissions {
  UsersManageAll,
  RolesManageAll,
}
