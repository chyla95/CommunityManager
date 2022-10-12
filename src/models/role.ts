import mongoose from "mongoose";

export interface IRole extends mongoose.Document {
  name: string;
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
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret._id;
    },
  },
};

// Naming: manageAll / manageOwn
const schema = new mongoose.Schema<IRole>(
  {
    name: { type: String, required: true, unique: true },
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
